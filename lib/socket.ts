import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

export type AssignmentStatus = {
  assignmentId: string;
  status: "queued" | "processing" | "completed" | "failed";
  paperId?: string;
  error?: string;
};

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) socket = io(WS_URL, { transports: ["websocket", "polling"] });
  return socket;
}

export function subscribeToAssignment(
  id: string,
  onStatus: (s: AssignmentStatus) => void
): () => void {
  const s = getSocket();
  s.emit("assignment:subscribe", id);

  const handler = (payload: AssignmentStatus) => {
    if (payload.assignmentId === id) onStatus(payload);
  };
  s.on("assignment:status", handler);

  return () => {
    s.emit("assignment:unsubscribe", id);
    s.off("assignment:status", handler);
  };
}
