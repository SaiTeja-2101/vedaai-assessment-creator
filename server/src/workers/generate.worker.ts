import { Worker } from "bullmq";
import { GENERATE_QUEUE, enqueuePdf } from "../queue/queues.js";
import { redis, redisConnection } from "../queue/redis.js";
import { Assignment } from "../models/Assignment.js";
import { QuestionPaper } from "../models/QuestionPaper.js";
import { Profile } from "../models/Profile.js";
import { llm } from "../ai/provider.js";
import { buildPrompt } from "../ai/prompt.js";
import { paperSchema, extractJson, type GeneratedPaper } from "../ai/schema.js";
import type { FilePart } from "../ai/provider.js";
import { emitStatus } from "../socket/io.js";

const PAPER_TTL = 60 * 60 * 24; // 1 day

async function generate(system: string, user: string, files: FilePart[]): Promise<GeneratedPaper> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const hint = attempt === 0 ? user : `${user}\n\nYour previous output was invalid. Return ONLY valid JSON matching the schema.`;
    const raw = await llm.generateJSON(system, hint, files);
    const parsed = paperSchema.safeParse(extractJson(raw));
    if (parsed.success) return parsed.data;
  }
  throw new Error("Model failed to return a valid question paper");
}

async function processJob(assignmentId: string) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return;

  const title = assignment.title ?? undefined;
  assignment.status = "processing";
  await assignment.save();
  emitStatus({ assignmentId, status: "processing", stage: "Reading your inputs…", progress: 10, title });

  const sourceFile = assignment.sourceFile as
    | { data: Buffer; mimeType: string; name: string }
    | undefined;
  // Only images are model-readable on Groq vision; PDFs fall back to topic-only.
  const isImage = !!sourceFile?.data && sourceFile.mimeType.startsWith("image/");
  const files: FilePart[] = isImage
    ? [{ data: sourceFile!.data.toString("base64"), mimeType: sourceFile!.mimeType }]
    : [];

  const profile = await Profile.findOne();
  const schoolHeader = profile
    ? [profile.schoolName, profile.address].filter(Boolean).join(", ")
    : undefined;

  const { system, user } = buildPrompt({
    title,
    className: (assignment.get("className") as string) || undefined,
    schoolHeader,
    board: profile?.board || undefined,
    questionConfig: assignment.questionConfig as { type: string; count: number; marksEach: number }[],
    additionalInstructions: assignment.additionalInstructions ?? undefined,
    hasFile: files.length > 0,
  });

  emitStatus({ assignmentId, status: "processing", stage: "Drafting questions with AI…", progress: 35, title });
  const paper = await generate(system, user, files);

  emitStatus({ assignmentId, status: "processing", stage: "Checking & formatting…", progress: 75, title });
  const saved = await QuestionPaper.create({ assignmentId, ...paper });

  emitStatus({ assignmentId, status: "processing", stage: "Saving your paper…", progress: 90, title });
  assignment.status = "completed";
  assignment.set("paperId", saved._id);
  if (!assignment.title || assignment.title === "Untitled Assignment") {
    assignment.title = `${paper.subject} — Class ${paper.className}`.trim();
  }
  await assignment.save();

  await redis?.set(`paper:${assignmentId}`, JSON.stringify(paper), "EX", PAPER_TTL);
  await enqueuePdf(assignmentId);
  emitStatus({
    assignmentId,
    status: "completed",
    progress: 100,
    paperId: String(saved._id),
    title: assignment.title ?? title,
  });
}

export const generateWorker = new Worker(
  GENERATE_QUEUE,
  async (job) => processJob(job.data.assignmentId as string),
  { connection: redisConnection!, concurrency: 3 }
);

generateWorker.on("failed", async (job, err) => {
  const assignmentId = job?.data?.assignmentId as string | undefined;
  if (!assignmentId) return;
  if (job && job.attemptsMade < (job.opts.attempts ?? 1)) return;
  const a = await Assignment.findByIdAndUpdate(assignmentId, { status: "failed", error: err.message });
  emitStatus({ assignmentId, status: "failed", error: err.message, title: a?.title ?? undefined });
});
