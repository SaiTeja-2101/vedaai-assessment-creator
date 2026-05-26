"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { MOBILE_TABS } from "@/lib/nav";

export default function MobileTabBar({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={`fixed inset-x-0 bottom-0 z-30 px-5 pb-4 ${className}`}>
      {/* Floating create button, sits above the bar on the right */}
      <div className="mb-3 flex justify-end">
        <Link
          href="/assignments/new"
          aria-label="Create assignment"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0px_16px_48px_rgba(0,0,0,0.12),0px_8px_24px_rgba(0,0,0,0.18)] transition-transform active:scale-95"
        >
          <Plus size={22} className="text-orange" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Tab bar */}
      <nav className="flex items-center justify-between rounded-3xl bg-[var(--color-dark)] px-6 py-3 shadow-[0px_16px_48px_rgba(0,0,0,0.25)]">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = !!tab.enabled && pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.enabled ? tab.href : "#"}
              className="flex flex-col items-center gap-1"
            >
              <Icon
                size={20}
                className={active ? "text-white" : "text-white/25"}
                fill={active ? "white" : "transparent"}
              />
              <span
                className={`text-[12px] font-semibold leading-[1.4] ${
                  active ? "text-white" : "text-white/25"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
