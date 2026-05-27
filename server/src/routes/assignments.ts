import { Router } from "express";
import { z } from "zod";
import { Assignment } from "../models/Assignment.js";
import { QuestionPaper } from "../models/QuestionPaper.js";
import { enqueueGeneration } from "../queue/queues.js";
import { redis } from "../queue/redis.js";
import { toDisplayDate, parseDueDate } from "../lib/dates.js";

export const assignmentsRouter = Router();

const ACCEPTED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];

const createSchema = z.object({
  title: z.string().trim().min(1).optional(),
  className: z.string().trim().optional(),
  dueDate: z.string().min(1),
  sourceText: z.string().optional(),
  additionalInstructions: z.string().optional(),
  questionConfig: z
    .array(
      z.object({
        type: z.string().min(1),
        count: z.number().int().positive(),
        marksEach: z.number().int().positive(),
      })
    )
    .min(1),
  file: z
    .object({
      name: z.string(),
      mimeType: z.enum(ACCEPTED_FILE_TYPES as [string, ...string[]]),
      dataBase64: z.string().min(1),
    })
    .optional(),
});

function serialize(a: InstanceType<typeof Assignment>) {
  return {
    id: String(a._id),
    title: a.title,
    status: a.status,
    assignedOn: toDisplayDate(a.createdAt as Date),
    dueDate: a.dueDate ? toDisplayDate(a.dueDate) : "",
    paperId: a.paperId ? String(a.paperId) : null,
  };
}

assignmentsRouter.get("/", async (_req, res) => {
  const items = await Assignment.find().sort({ createdAt: -1 });
  res.json(items.map(serialize));
});

assignmentsRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const due = parseDueDate(parsed.data.dueDate);
  if (!due) return res.status(400).json({ error: "Invalid dueDate" });

  const file = parsed.data.file;
  const sourceFile = file
    ? { data: Buffer.from(file.dataBase64, "base64"), mimeType: file.mimeType, name: file.name }
    : undefined;

  const assignment = await Assignment.create({
    title: parsed.data.title,
    className: parsed.data.className,
    dueDate: due,
    sourceText: parsed.data.sourceText,
    sourceFile,
    additionalInstructions: parsed.data.additionalInstructions,
    questionConfig: parsed.data.questionConfig,
    status: "queued",
  });

  await enqueueGeneration(String(assignment._id));
  res.status(201).json(serialize(assignment));
});

assignmentsRouter.post("/:id/regenerate", async (req, res) => {
  const a = await Assignment.findById(req.params.id).catch(() => null);
  if (!a) return res.status(404).json({ error: "Not found" });
  if (a.paperId) await QuestionPaper.findByIdAndDelete(a.paperId).catch(() => null);
  a.status = "queued";
  a.error = undefined;
  a.paperId = undefined;
  await a.save();
  await redis?.del(`paper:${a._id}`).catch(() => null);
  await enqueueGeneration(String(a._id));
  res.json(serialize(a));
});

assignmentsRouter.get("/:id/paper", async (req, res) => {
  const cacheKey = `paper:${req.params.id}`;
  const cached = await redis?.get(cacheKey).catch(() => null);
  if (cached) return res.json(JSON.parse(cached));

  const paper = await QuestionPaper.findOne({ assignmentId: req.params.id })
    .sort({ generatedAt: -1 })
    .lean()
    .catch(() => null);
  if (!paper) return res.status(404).json({ error: "Paper not ready" });

  const body = {
    schoolName: paper.schoolName,
    subject: paper.subject,
    className: paper.className,
    durationMins: paper.durationMins,
    totalMarks: paper.totalMarks,
    generalInstructions: paper.generalInstructions,
    sections: paper.sections,
    answerKey: paper.answerKey,
  };
  await redis?.set(cacheKey, JSON.stringify(body), "EX", 60 * 60 * 24).catch(() => null);
  res.json(body);
});

assignmentsRouter.get("/:id/pdf", async (req, res) => {
  const paper = await QuestionPaper.findOne({ assignmentId: req.params.id })
    .sort({ generatedAt: -1 })
    .select("pdf subject className")
    .catch(() => null);
  const pdf = paper?.get("pdf") as Buffer | undefined;
  if (!pdf) return res.status(404).json({ error: "PDF not ready" });

  const name = `${paper?.get("subject") ?? "question-paper"}`.replace(/[^\w]+/g, "-").toLowerCase();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${name || "question-paper"}.pdf"`);
  res.send(pdf);
});

assignmentsRouter.get("/:id", async (req, res) => {
  const a = await Assignment.findById(req.params.id).catch(() => null);
  if (!a) return res.status(404).json({ error: "Not found" });
  res.json(serialize(a));
});

assignmentsRouter.delete("/:id", async (req, res) => {
  const a = await Assignment.findByIdAndDelete(req.params.id).catch(() => null);
  if (!a) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});
