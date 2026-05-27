const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiAssignment = {
  id: string;
  title: string;
  status: "queued" | "processing" | "completed" | "failed";
  assignedOn: string;
  dueDate: string;
  paperId: string | null;
};

export type CreatePayload = {
  title?: string;
  className?: string;
  dueDate: string;
  additionalInstructions?: string;
  file?: { name: string; mimeType: string; dataBase64: string };
  questionConfig: { type: string; count: number; marksEach: number }[];
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed (${res.status})`);
  }
  return res.json();
}

export function listAssignments() {
  return fetch(`${BASE}/api/assignments`, { cache: "no-store" }).then(json<ApiAssignment[]>);
}

export function createAssignment(payload: CreatePayload) {
  return fetch(`${BASE}/api/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(json<ApiAssignment>);
}

export function getAssignment(id: string) {
  return fetch(`${BASE}/api/assignments/${id}`, { cache: "no-store" }).then(json<ApiAssignment>);
}

export async function deleteAssignment(id: string) {
  const res = await fetch(`${BASE}/api/assignments/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
}

export type PaperData = {
  schoolName: string;
  subject: string;
  className: string;
  durationMins: number;
  totalMarks: number;
  generalInstructions: string;
  sections: {
    name: string;
    title: string;
    instruction: string;
    questions: { text: string; difficulty: "easy" | "moderate" | "challenging"; marks: number }[];
  }[];
  answerKey: { n: number; answer: string }[];
};

export async function getPaper(id: string): Promise<PaperData | null> {
  const res = await fetch(`${BASE}/api/assignments/${id}/paper`, { cache: "no-store" });
  if (res.status === 404) return null;
  return json<PaperData>(res);
}

export function regenerateAssignment(id: string) {
  return fetch(`${BASE}/api/assignments/${id}/regenerate`, { method: "POST" }).then(
    json<ApiAssignment>
  );
}
