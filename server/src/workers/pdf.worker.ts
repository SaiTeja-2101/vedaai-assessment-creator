import { Worker } from "bullmq";
import { PDF_QUEUE } from "../queue/queues.js";
import { redisConnection } from "../queue/redis.js";
import { QuestionPaper } from "../models/QuestionPaper.js";
import { renderPaperPdf } from "../pdf/render.js";
import type { GeneratedPaper } from "../ai/schema.js";

async function processPdf(assignmentId: string) {
  const paper = await QuestionPaper.findOne({ assignmentId }).sort({ generatedAt: -1 });
  if (!paper) return;

  const buffer = await renderPaperPdf(paper.toObject() as unknown as GeneratedPaper);
  paper.set("pdf", buffer);
  await paper.save();
}

export const pdfWorker = new Worker(
  PDF_QUEUE,
  async (job) => processPdf(job.data.assignmentId as string),
  { connection: redisConnection!, concurrency: 2 }
);
