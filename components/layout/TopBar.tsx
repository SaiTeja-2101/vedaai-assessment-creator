"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, User } from "lucide-react";

function titleFor(pathname: string): string {
  if (pathname.startsWith("/assignments")) return "Assignment";
  if (pathname.startsWith("/toolkit")) return "AI Teacher's Toolkit";
  return "Dashboard";
}

export default function TopBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <header
      className={`h-[56px] items-center gap-2.5 rounded-2xl bg-white/75 pl-6 pr-3 backdrop-blur-sm ${className}`}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-200 active:scale-95"
      >
        <ArrowLeft size={24} className="text-ink" />
      </button>

      {/* Breadcrumb / page title (muted per Figma) */}
      <div className="flex flex-1 items-center gap-2">
        <LayoutGrid size={20} className="text-[var(--color-disabled)]" />
        <span className="text-[16px] font-semibold text-[var(--color-disabled)]">
          {title}
        </span>
      </div>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-offwhite)] transition-colors hover:bg-[#ededed]"
      >
        <Bell size={22} className="text-ink" />
        <span className="absolute right-[7px] top-[5px] h-2 w-2 rounded-full bg-orange ring-2 ring-[var(--color-offwhite)]" />
      </button>

      {/* Profile */}
      <button
        type="button"
        className="flex h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 shadow-[0px_16px_48px_rgba(0,0,0,0.10),0px_24px_40px_rgba(0,0,0,0.12)] transition-colors hover:bg-white/60"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-offwhite)]">
          <User size={18} className="text-[var(--color-muted)]" />
        </span>
        <span className="text-[16px] font-semibold text-ink">John Doe</span>
        <ChevronDown size={20} className="text-ink" />
      </button>
    </header>
  );
}
