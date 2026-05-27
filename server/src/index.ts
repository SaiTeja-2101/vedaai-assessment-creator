import http from "http";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectMongo, mongoStatus } from "./db/mongo.js";
import { redisStatus } from "./queue/redis.js";
import { initSocket } from "./socket/io.js";
import { assignmentsRouter } from "./routes/assignments.js";

const app = express();
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", mongo: mongoStatus(), redis: redisStatus() });
});

app.use("/api/assignments", assignmentsRouter);

const server = http.createServer(app);
initSocket(server);

async function start() {
  await connectMongo().catch((err) => console.error("Mongo connect failed:", err.message));
  if (env.REDIS_URL) {
    await import("./workers/generate.worker.js");
    console.log("Generation worker started");
  }
  server.listen(env.PORT, () => console.log(`API on http://localhost:${env.PORT}`));
}

start();
