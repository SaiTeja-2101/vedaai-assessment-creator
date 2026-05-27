"use client";

import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToasts } from "@/lib/toast";

const ICON = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};
const ACCENT = {
  success: "text-[#1E9E5A]",
  error: "text-[#C53535]",
  info: "text-orange",
};

export default function Toaster() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[320px] max-w-[calc(100vw-2.5rem)] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICON[t.variant];
        return (
          <div
            key={t.id}
            className="animate-rise pointer-events-auto flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0px_16px_40px_rgba(0,0,0,0.16)]"
          >
            <Icon size={20} className={`mt-0.5 shrink-0 ${ACCENT[t.variant]}`} />
            <p className="flex-1 text-[14px] font-medium leading-snug text-ink">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-[#9a9a9a] transition-colors hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
