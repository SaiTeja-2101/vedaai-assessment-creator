import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * "No assignments yet" empty state.
 * Layout mirrors the Figma frame: illustration + (title/paragraph) grouped with
 * 12px gaps, and the dark CTA button 32px below that group.
 */
export default function EmptyState() {
  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-8">
      <div className="flex max-w-[486px] flex-col items-center gap-3">
        <Image
          src="/Illustrations.png"
          alt=""
          aria-hidden
          width={300}
          height={300}
          priority
          className="h-[220px] w-[220px] animate-float select-none lg:h-[300px] lg:w-[300px]"
        />

        <div className="flex flex-col items-center gap-0.5 text-center">
          <h1 className="text-[20px] font-bold leading-[1.4] text-ink">
            No assignments yet
          </h1>
          <p className="text-[16px] leading-[1.4] text-ink-soft">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let
            AI assist with grading.
          </p>
        </div>
      </div>

      <Link
        href="/assignments/new"
        className="flex h-[46px] items-center gap-1 rounded-[48px] bg-[var(--color-dark)] px-6 text-white shadow-[0px_10px_24px_rgba(24,24,24,0.22)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className="text-[16px] font-medium">Create Your First Assignment</span>
      </Link>
    </div>
  );
}
