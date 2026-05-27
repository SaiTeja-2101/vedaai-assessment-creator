import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: env.CLIENT_ORIGIN, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    socket.on("assignment:subscribe", (id: string) => socket.join(id));
    socket.on("assignment:unsubscribe", (id: string) => socket.leave(id));
  });

  return io;
}

type StatusPayload = {
  assignmentId: string;
  status: "queued" | "processing" | "completed" | "failed";
  paperId?: string;
  error?: string;
};

export function emitStatus(payload: StatusPayload) {
  io?.to(payload.assignmentId).emit("assignment:status", payload);
}
