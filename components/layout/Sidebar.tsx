"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Sparkles, Settings } from "lucide-react";
import Logo from "./Logo";
import { SIDEBAR_NAV, type NavItem } from "@/lib/nav";
import { useAssignments } from "@/lib/assignments";
import { useProfile, logoUrl } from "@/lib/profile";

function NavRow({
  item,
  active,
  badge,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.enabled ? item.href : "#"}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-lg px-3 py-[9px] transition-colors duration-200 ${
        active ? "bg-[var(--color-offwhite-2)]" : "hover:bg-[var(--color-offwhite)]"
      }`}
    >
      <Icon
        size={20}
        strokeWidth={2}
        className={active ? "text-ink" : ""}
        style={active ? undefined : { color: "var(--ink-soft)" }}
      />
      <span
        className={`flex-1 text-[16px] leading-[1.4] ${active ? "font-medium text-ink" : "font-normal"}`}
        style={active ? undefined : { color: "var(--ink-soft)" }}
      >
        {item.label}
      </span>
      {badge ? (
        <span className="flex h-5 min-w-[24px] items-center justify-center rounded-full bg-orange px-2.5 text-[14px] font-semibold text-white shadow-[inset_0px_0px_8px_rgba(255,161,10,0.25)]">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const assignmentsCount = useAssignments((s) => s.items.length);
  const fetchAssignments = useAssignments((s) => s.fetch);
  const profile = useProfile((s) => s.profile);
  const fetchProfile = useProfile((s) => s.fetch);

  useEffect(() => {
    void fetchAssignments();
    void fetchProfile();
  }, [fetchAssignments, fetchProfile]);

  const logo = logoUrl(profile);
  const initials = (profile?.schoolName ?? "DPS").slice(0, 2).toUpperCase();

  return (
    <aside
      className={`w-[304px] shrink-0 flex-col justify-between rounded-2xl bg-white p-6 shadow-[0px_16px_48px_rgba(0,0,0,0.12),0px_32px_48px_rgba(0,0,0,0.2)] ${className}`}
    >
      {/* Top group: logo, create button, nav (56px gaps per Figma) */}
      <div className="flex flex-col gap-14">
        <Link href="/assignments" className="px-1" aria-label="VedaAI — Assignments">
          <Logo size={40} textSize={28} />
        </Link>

        {/* Create Assignment — dark pill with a soft orange gradient ring */}
        <div className="rounded-full bg-gradient-to-b from-[#F2A074] to-[#E2613A] p-[1.5px] shadow-[0_8px_24px_rgba(255,86,35,0.28)]">
          <Link
            href="/assignments/new"
            className="flex h-[42px] w-full items-center justify-center gap-2.5 rounded-full bg-[var(--color-create)] shadow-[inset_0px_-1px_3.5px_rgba(177,177,177,0.35),inset_0px_0px_34.5px_rgba(255,255,255,0.12)] transition-transform duration-200 active:scale-[0.98]"
          >
            <Sparkles size={18} className="text-white" fill="white" />
            <span
              className="text-[16px] font-medium text-white"
              style={{ fontFamily: "var(--font-inter)", letterSpacing: "-0.04em" }}
            >
              Create Assignment
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-2">
          {SIDEBAR_NAV.map((item) => (
            <NavRow
              key={item.label}
              item={item}
              active={!!item.enabled && pathname.startsWith(item.href)}
              badge={item.href === "/assignments" ? assignmentsCount : undefined}
            />
          ))}
        </nav>
      </div>

      {/* Bottom group: settings + school profile card */}
      <div className="flex flex-col gap-2">
        <Link
          href="/settings"
          aria-current={pathname.startsWith("/settings") ? "page" : undefined}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 ${
            pathname.startsWith("/settings")
              ? "bg-[var(--color-offwhite-2)]"
              : "hover:bg-[var(--color-offwhite)]"
          }`}
        >
          <Settings
            size={20}
            className={pathname.startsWith("/settings") ? "text-ink" : ""}
            style={pathname.startsWith("/settings") ? undefined : { color: "var(--ink-soft)" }}
          />
          <span
            className={`text-[16px] ${pathname.startsWith("/settings") ? "font-medium text-ink" : ""}`}
            style={pathname.startsWith("/settings") ? undefined : { color: "var(--ink-soft)" }}
          >
            Settings
          </span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-2xl bg-[var(--color-offwhite-2)] p-3 transition-colors hover:bg-[#e9e9e9]"
        >
          <div className="flex h-14 w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#FFD7A8] to-[#F0A36B] text-[14px] font-bold text-[#7A4A1E]">
            {logo ? (
              <Image src={logo} alt="" width={52} height={56} className="h-full w-full object-cover" unoptimized />
            ) : (
              initials
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[16px] font-bold text-ink">
              {profile?.schoolName ?? "Delhi Public School"}
            </span>
            <span className="truncate text-[14px] text-[var(--color-muted)]">
              {profile?.city ?? "Bokaro Steel City"}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
