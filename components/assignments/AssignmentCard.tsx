"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import type { Assignment } from "@/lib/assignments";

type AssignmentCardProps = {
  assignment: Assignment;
  onDelete: (id: string) => void;
};

/** A single assignment card with a kebab menu (View Assignment / Delete). */
export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div className="flex min-h-[116px] flex-col justify-between rounded-3xl bg-white/75 p-5 backdrop-blur-sm transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)] lg:min-h-[162px] lg:bg-white lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[18px] font-bold leading-[1.4] text-ink lg:text-[24px] lg:font-extrabold lg:leading-[1.2]">
          {assignment.title}
        </h3>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Assignment options"
            aria-haspopup="menu"
            className="-mr-1 flex h-6 w-6 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5 lg:text-[#A9A9A9]"
          >
            <MoreVertical size={24} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-8 z-30 w-[140px] animate-rise overflow-hidden rounded-2xl bg-white p-2 shadow-[0px_16px_48px_rgba(0,0,0,0.2),0px_8px_24px_rgba(0,0,0,0.06)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/assignments/${assignment.id}`);
                }}
                className="flex w-full items-center rounded-lg px-2 py-1.5 text-left text-[14px] font-medium text-ink transition-colors hover:bg-[var(--color-offwhite)]"
              >
                View Assignment
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(assignment.id);
                }}
                className="mt-1 flex w-full items-center rounded-lg bg-[var(--color-offwhite)] px-2 py-1.5 text-left text-[14px] font-medium text-[#C53535] transition-colors hover:bg-[#fdecec]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <DateLabel label="Assigned on" value={assignment.assignedOn} />
        <DateLabel label="Due" value={assignment.dueDate} />
      </div>
    </div>
  );
}

function DateLabel({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[16px] leading-[1.2]">
      <span className="font-medium text-[#5E5E5E]">{label} : </span>
      <span className="font-extrabold text-ink">{value}</span>
    </span>
  );
}
