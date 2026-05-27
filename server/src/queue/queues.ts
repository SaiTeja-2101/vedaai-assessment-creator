import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";

export const GENERATE_QUEUE = "generate";

export const generateQueue = redisConnection
  ? new Queue(GENERATE_QUEUE, { connection: redisConnection })
  : null;

export async function enqueueGeneration(assignmentId: string) {
  if (!generateQueue) {
    console.warn("Redis not configured — cannot enqueue generation");
    return;
  }
  await generateQueue.add(
    "generate",
    { assignmentId },
    { attempts: 2, backoff: { type: "fixed", delay: 2000 }, removeOnComplete: 50, removeOnFail: 50 }
  );
}
