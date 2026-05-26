"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type DropdownProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** Options already chosen elsewhere — shown disabled. */
  disabledOptions?: string[];
  size?: "desktop" | "mobile";
};

/**
 * Custom select rendered as a rounded white pill with a chevron. A native
 * <select> can't be styled to match the Figma popover, so this is a controlled
 * popover that closes on outside-click / Escape.
 */
export default function Dropdown({
  value,
  options,
  onChange,
  disabledOptions = [],
  size = "desktop",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const textSize = size === "desktop" ? "text-[16px]" : "text-[14px]";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-11 w-full items-center justify-between rounded-full bg-white px-4 ${textSize} font-medium text-ink transition-shadow hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`ml-2 shrink-0 text-ink transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-2 max-h-72 w-full animate-rise overflow-auto rounded-2xl border border-black/5 bg-white p-1.5 shadow-[0px_16px_40px_rgba(0,0,0,0.14)]"
        >
          {options.map((opt) => {
            const isDisabled = disabledOptions.includes(opt) && opt !== value;
            const selected = opt === value;
            return (
              <li key={opt}>
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                    selected
                      ? "bg-[var(--color-offwhite-2)] text-ink"
                      : isDisabled
                        ? "cursor-not-allowed text-[#c4c4c4]"
                        : "text-ink hover:bg-[var(--color-offwhite)]"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {selected && <Check size={16} className="shrink-0 text-orange" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
