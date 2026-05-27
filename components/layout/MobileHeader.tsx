"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, User } from "lucide-react";
import Logo from "./Logo";
import { useProfile, logoUrl } from "@/lib/profile";

export default function MobileHeader({ className = "" }: { className?: string }) {
  const profile = useProfile((s) => s.profile);
  const fetchProfile = useProfile((s) => s.fetch);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const logo = logoUrl(profile);

  return (
    <header className={`sticky top-0 z-30 px-5 pt-4 pb-2 ${className}`}>
      <div className="flex h-14 items-center justify-between rounded-2xl bg-white pl-3 pr-4 shadow-[0px_8px_24px_rgba(0,0,0,0.08)]">
        <Link href="/assignments" aria-label="VedaAI — Assignments">
          <Logo size={28} textSize={20} />
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-offwhite)]"
          >
            <Bell size={22} className="text-ink" />
            <span className="absolute right-[7px] top-[5px] h-2 w-2 rounded-full bg-orange ring-2 ring-[var(--color-offwhite)]" />
          </button>

          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--color-offwhite)]"
          >
            {logo ? (
              <Image src={logo} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized />
            ) : (
              <User size={18} className="text-[var(--color-muted)]" />
            )}
          </Link>

          <Link href="/settings" aria-label="Menu" className="flex h-6 w-6 items-center justify-center">
            <Menu size={24} className="text-[#1D1B20]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
