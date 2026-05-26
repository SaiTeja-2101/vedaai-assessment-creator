import { create } from "zustand";

export type Assignment = {
  id: string;
  title: string;
  assignedOn: string; // DD-MM-YYYY
  dueDate: string; // DD-MM-YYYY
};

const uid = () => Math.random().toString(36).slice(2, 9);

// Seed data so the "filled" state is visible before the backend exists.
// In the backend phase this list is replaced by a fetch from the API.
const seed = (): Assignment[] =>
  [
    { title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025" },
    { title: "Algebra: Linear Equations", assignedOn: "18-06-2025", dueDate: "25-06-2025" },
    { title: "The Solar System", assignedOn: "15-06-2025", dueDate: "22-06-2025" },
    { title: "Reading Comprehension", assignedOn: "12-06-2025", dueDate: "19-06-2025" },
    { title: "Acids, Bases & Salts", assignedOn: "10-06-2025", dueDate: "20-06-2025" },
    { title: "Indian Freedom Struggle", assignedOn: "08-06-2025", dueDate: "16-06-2025" },
  ].map((a) => ({ id: uid(), ...a }));

type AssignmentsState = {
  items: Assignment[];
  add: (a: Omit<Assignment, "id">) => void;
  remove: (id: string) => void;
};

export const useAssignments = create<AssignmentsState>((set) => ({
  items: seed(),
  add: (a) => set((s) => ({ items: [{ id: uid(), ...a }, ...s.items] })),
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));
