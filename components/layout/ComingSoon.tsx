import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="animate-rise mx-auto flex h-full min-h-[60vh] max-w-[460px] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0px_12px_32px_rgba(0,0,0,0.08)]">
        <Icon size={28} className="text-ink" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-bold text-ink">{title}</h1>
        <p className="text-[15px] leading-relaxed text-ink-soft">{subtitle}</p>
      </div>
      <span className="rounded-full bg-[var(--color-offwhite-2)] px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Coming soon
      </span>
    </div>
  );
}
