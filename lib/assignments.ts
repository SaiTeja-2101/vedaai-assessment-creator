import { create } from "zustand";
import { listAssignments, deleteAssignment, type ApiAssignment } from "./api";

export type Assignment = ApiAssignment;

type AssignmentsState = {
  items: Assignment[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useAssignments = create<AssignmentsState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,
  fetch: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      set({ items: await listAssignments(), loaded: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to load" });
    } finally {
      set({ loading: false });
    }
  },
  remove: async (id) => {
    await deleteAssignment(id);
    set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
  },
}));
