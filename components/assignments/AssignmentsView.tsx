"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, Search, Plus } from "lucide-react";
import { useAssignments } from "@/lib/assignments";
import AssignmentCard from "./AssignmentCard";
import EmptyState from "./EmptyState";

export default function AssignmentsView() {
  const router = useRouter();
  const { items, remove } = useAssignments();
  const [query, setQuery] = useState("");

  // No assignments at all → empty state.
  if (items.length === 0) {
    return <EmptyState />;
  }

  const filtered = items.filter((a) =>
    a.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="animate-rise mx-auto flex w-full max-w-[1100px] flex-col gap-3 pb-28 lg:gap-3 lg:pb-24">
      {/* Header — desktop */}
      <div className="hidden items-center gap-3 px-2 lg:flex">
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span className="absolute h-3 w-3 rounded-full bg-[#4BC26D]/40" />
          <span className="h-2 w-2 rounded-full bg-[#4BC26D]" />
        </span>
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold leading-[1.4] text-ink">Assignments</h1>
          <p className="text-[14px] leading-[1.4] text-[rgba(94,94,94,0.55)]">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* Header — mobile */}
      <div className="relative mb-1 flex items-center justify-center lg:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-transform active:scale-95"
        >
          <ArrowLeft size={24} className="text-ink" strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-bold text-ink">Assignments</h1>
      </div>

      {/* Toolbar */}
      <div className="flex h-16 items-center justify-between gap-6 rounded-2xl bg-white px-4 lg:rounded-[20px]">
        <button
          type="button"
          className="flex items-center gap-1 text-[var(--color-disabled)] lg:gap-1"
        >
          <Filter size={20} className="fill-current" />
          <span className="text-[14px] font-bold">
            <span className="lg:hidden">Filter</span>
            <span className="hidden lg:inline">Filter By</span>
          </span>
        </button>

        <div className="flex h-11 max-w-[380px] flex-1 items-center gap-3 rounded-full border border-black/20 px-4">
          <Search size={20} className="shrink-0 text-[var(--color-disabled)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Assignment"
            className="w-full bg-transparent text-[14px] font-medium text-ink placeholder:font-bold placeholder:text-[var(--color-disabled)] focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-ink-soft">
          No assignments match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((a) => (
            <AssignmentCard key={a.id} assignment={a} onDelete={remove} />
          ))}
        </div>
      )}

      {/* Desktop floating Create bar — frosted fade that blends into the canvas */}
      <div className="sticky bottom-0 z-10 mt-2 hidden lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--canvas)] via-[var(--canvas)]/80 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_top,black_45%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_45%,transparent)]"
        />
        <div className="relative flex justify-center pb-3 pt-10">
          <Link
            href="/assignments/new"
            className="flex h-[46px] items-center gap-1 rounded-full bg-[var(--color-dark)] px-6 text-[16px] font-medium text-white shadow-[0_10px_28px_rgba(24,24,24,0.28)] transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} strokeWidth={2.5} />
            Create Assignment
          </Link>
        </div>
      </div>
    </div>
  );
}
