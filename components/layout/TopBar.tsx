"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, User, Settings } from "lucide-react";
import { useProfile, logoUrl } from "@/lib/profile";

function titleFor(pathname: string): string {
  if (pathname.startsWith("/assignments")) return "Assignment";
  if (pathname.startsWith("/toolkit")) return "AI Teacher's Toolkit";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/groups")) return "My Groups";
  if (pathname.startsWith("/library")) return "My Library";
  return "Dashboard";
}

export default function TopBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = titleFor(pathname);

  const profile = useProfile((s) => s.profile);
  const fetchProfile = useProfile((s) => s.fetch);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const logo = logoUrl(profile);
  const name = profile?.teacherName || "John Doe";

  return (
    <header
      className={`h-[56px] items-center gap-2.5 rounded-2xl bg-white/75 pl-6 pr-3 backdrop-blur-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-200 active:scale-95"
      >
        <ArrowLeft size={24} className="text-ink" />
      </button>

      <div className="flex flex-1 items-center gap-2">
        <LayoutGrid size={20} className="text-[var(--color-disabled)]" />
        <span className="text-[16px] font-semibold text-[var(--color-disabled)]">{title}</span>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-offwhite)] transition-colors hover:bg-[#ededed]"
      >
        <Bell size={22} className="text-ink" />
        <span className="absolute right-[7px] top-[5px] h-2 w-2 rounded-full bg-orange ring-2 ring-[var(--color-offwhite)]" />
      </button>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-11 items-center gap-2 rounded-xl px-3 py-1.5 shadow-[0px_16px_48px_rgba(0,0,0,0.10),0px_24px_40px_rgba(0,0,0,0.12)] transition-colors hover:bg-white/60"
        >
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-offwhite)]">
            {logo ? (
              <Image src={logo} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized />
            ) : (
              <User size={18} className="text-[var(--color-muted)]" />
            )}
          </span>
          <span className="max-w-[120px] truncate text-[16px] font-semibold text-ink">{name}</span>
          <ChevronDown
            size={20}
            className={`text-ink transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-40 w-44 animate-rise rounded-2xl bg-white p-1.5 shadow-[0px_16px_40px_rgba(0,0,0,0.16)]">
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-[var(--color-offwhite)]"
            >
              <Settings size={16} />
              Settings
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
