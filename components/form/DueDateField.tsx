"use client";

import { useRef } from "react";
import { CalendarPlus } from "lucide-react";

type DueDateFieldProps = {
  /** Stored as DD-MM-YYYY (display format). */
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

const toDisplay = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};
const toIso = (display: string) => {
  if (!display) return "";
  const [d, m, y] = display.split("-");
  return d && m && y ? `${y}-${m}-${d}` : "";
};

/**
 * Due-date input: a styled pill showing DD-MM-YYYY, backed by a native date
 * picker (opened via the calendar button) so we get OS-native date selection
 * while keeping the Figma look.
 */
export default function DueDateField({ value, onChange, invalid }: DueDateFieldProps) {
  const dateRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = dateRef.current;
    if (!el) return;
    // showPicker is supported in modern browsers; fall back to focus.
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <button
      type="button"
      onClick={openPicker}
      className={`relative flex h-11 w-full items-center justify-between rounded-full border-[1.25px] bg-transparent px-4 text-left transition-colors ${
        invalid ? "border-red-400" : "border-[#DADADA] hover:border-[#c4c4c4]"
      }`}
    >
      <span
        className={`text-[16px] font-medium ${value ? "text-ink" : "text-[var(--color-disabled)]"}`}
      >
        {value || "DD-MM-YYYY"}
      </span>
      <CalendarPlus size={22} className="text-[#2B2B2B]" />

      {/* Native date input drives the picker; visually hidden but focusable. */}
      <input
        ref={dateRef}
        type="date"
        min={today}
        value={toIso(value)}
        onChange={(e) => onChange(toDisplay(e.target.value))}
        className="pointer-events-none absolute right-3 bottom-0 h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden
      />
    </button>
  );
}
