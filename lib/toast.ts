import { create } from "zustand";

export type Toast = {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, variant?: Toast["variant"]) => void;
  dismiss: (id: string) => void;
};

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 5000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
