import { create } from "zustand";

/** A single question-type row in the Create Assignment form. */
export type QuestionRow = {
  id: string;
  type: string;
  count: number;
  marks: number;
};

/** Question types a teacher can choose from. */
export const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True / False",
  "Fill in the Blanks",
] as const;

const uid = () => Math.random().toString(36).slice(2, 9);

const defaultRows = (): QuestionRow[] => [
  { id: uid(), type: "Multiple Choice Questions", count: 4, marks: 1 },
  { id: uid(), type: "Short Questions", count: 3, marks: 2 },
  { id: uid(), type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { id: uid(), type: "Numerical Problems", count: 5, marks: 5 },
];

export type UploadedFile = { name: string; mimeType: string; dataBase64: string };

type AssignmentDraft = {
  title: string;
  className: string;
  file: UploadedFile | null;
  dueDate: string; // DD-MM-YYYY
  rows: QuestionRow[];
  additionalInfo: string;

  setTitle: (value: string) => void;
  setClassName: (value: string) => void;
  setFile: (file: UploadedFile | null) => void;
  setDueDate: (value: string) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, patch: Partial<Omit<QuestionRow, "id">>) => void;
  setAdditionalInfo: (value: string) => void;
  reset: () => void;
};

/**
 * Holds the in-progress assignment the teacher is building. Lives in a Zustand
 * store (not local state) because the generation flow + output page read the
 * same draft, and it must survive navigation between steps.
 */
export const useAssignmentDraft = create<AssignmentDraft>((set) => ({
  title: "",
  className: "",
  file: null,
  dueDate: "",
  rows: defaultRows(),
  additionalInfo: "",

  setTitle: (value) => set({ title: value }),
  setClassName: (value) => set({ className: value }),
  setFile: (file) => set({ file }),
  setDueDate: (value) => set({ dueDate: value }),
  addRow: () =>
    set((s) => {
      const used = new Set(s.rows.map((r) => r.type));
      const next = QUESTION_TYPES.find((t) => !used.has(t)) ?? QUESTION_TYPES[0];
      return { rows: [...s.rows, { id: uid(), type: next, count: 1, marks: 1 }] };
    }),
  removeRow: (id) => set((s) => ({ rows: s.rows.filter((r) => r.id !== id) })),
  updateRow: (id, patch) =>
    set((s) => ({
      rows: s.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
  setAdditionalInfo: (value) => set({ additionalInfo: value }),
  reset: () =>
    set({ title: "", className: "", file: null, dueDate: "", rows: defaultRows(), additionalInfo: "" }),
}));

/** Derived totals used by the form. */
export const totalsFor = (rows: QuestionRow[]) => ({
  totalQuestions: rows.reduce((n, r) => n + r.count, 0),
  totalMarks: rows.reduce((n, r) => n + r.count * r.marks, 0),
});
