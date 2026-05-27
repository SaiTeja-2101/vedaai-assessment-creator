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
  stage?: string;
  progress?: number;
  title?: string;
  paperId?: string;
  error?: string;
};

export function emitStatus(payload: StatusPayload) {
  if (!io) return;
  // Targeted to the open output page (full detail) + global feed for list/toasts.
  io.to(payload.assignmentId).emit("assignment:status", payload);
  io.emit("assignment:activity", {
    assignmentId: payload.assignmentId,
    status: payload.status,
    title: payload.title,
  });
}
