import { Worker } from "bullmq";
import { GENERATE_QUEUE } from "../queue/queues.js";
import { redisConnection } from "../queue/redis.js";
import { Assignment } from "../models/Assignment.js";
import { QuestionPaper } from "../models/QuestionPaper.js";
import { llm } from "../ai/provider.js";
import { buildPrompt } from "../ai/prompt.js";
import { paperSchema, extractJson, type GeneratedPaper } from "../ai/schema.js";
import { emitStatus } from "../socket/io.js";

async function generate(system: string, user: string): Promise<GeneratedPaper> {
  // One repair attempt if the first response doesn't match the schema.
  for (let attempt = 0; attempt < 2; attempt++) {
    const hint = attempt === 0 ? user : `${user}\n\nYour previous output was invalid. Return ONLY valid JSON matching the schema.`;
    const raw = await llm.generateJSON(system, hint);
    const parsed = paperSchema.safeParse(extractJson(raw));
    if (parsed.success) return parsed.data;
  }
  throw new Error("Model failed to return a valid question paper");
}

async function processJob(assignmentId: string) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return;

  assignment.status = "processing";
  await assignment.save();
  emitStatus({ assignmentId, status: "processing" });

  const { system, user } = buildPrompt({
    questionConfig: assignment.questionConfig as { type: string; count: number; marksEach: number }[],
    additionalInstructions: assignment.additionalInstructions ?? undefined,
    sourceText: assignment.sourceText ?? undefined,
  });

  const paper = await generate(system, user);

  const saved = await QuestionPaper.create({ assignmentId, ...paper });
  assignment.status = "completed";
  assignment.set("paperId", saved._id);
  if (!assignment.title || assignment.title === "Untitled Assignment") {
    assignment.title = `${paper.subject} — Class ${paper.className}`.trim();
  }
  await assignment.save();

  emitStatus({ assignmentId, status: "completed", paperId: String(saved._id) });
}

export const generateWorker = new Worker(
  GENERATE_QUEUE,
  async (job) => processJob(job.data.assignmentId as string),
  { connection: redisConnection!, concurrency: 3 }
);

generateWorker.on("failed", async (job, err) => {
  const assignmentId = job?.data?.assignmentId as string | undefined;
  if (!assignmentId) return;
  // Only mark failed once retries are exhausted.
  if (job && job.attemptsMade < (job.opts.attempts ?? 1)) return;
  await Assignment.findByIdAndUpdate(assignmentId, { status: "failed", error: err.message });
  emitStatus({ assignmentId, status: "failed", error: err.message });
});
