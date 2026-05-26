"use client";

import { Minus, Plus } from "lucide-react";

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Desktop pill is 100×44; mobile pill is 132×38. */
  size?: "desktop" | "mobile";
};

/**
 * White rounded "− N +" number control used for question count and marks.
 * Enforces a minimum so values can never go empty / zero / negative.
 */
export default function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "desktop",
}: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const pill =
    size === "desktop"
      ? "h-11 w-[100px] px-2"
      : "h-[38px] w-full px-2";

  return (
    <div
      className={`flex items-center justify-between rounded-full bg-white ${pill}`}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[#9a9a9a] transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-[#9a9a9a]"
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
      <span className="min-w-[10px] text-center text-[16px] font-medium text-ink tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        aria-label="Increase"
        className="flex h-6 w-6 items-center justify-center rounded-full text-[#9a9a9a] transition-colors hover:text-ink"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
