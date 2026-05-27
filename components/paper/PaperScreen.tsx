"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw, Check } from "lucide-react";
import { getPaper, getAssignment, regenerateAssignment, type PaperData } from "@/lib/api";
import { subscribeToAssignment } from "@/lib/socket";
import PaperView from "./PaperView";

type Phase = "loading" | "generating" | "ready" | "failed";

const STEPS = [
  { label: "Analyzing your inputs", at: 8 },
  { label: "Drafting questions", at: 34 },
  { label: "Formatting & answer key", at: 68 },
  { label: "Finalizing", at: 90 },
];

export default function PaperScreen({ id }: { id: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(6);

  const targetRef = useRef(10);
  const paperReadyRef = useRef(false); // paper fetched
  const generatingRef = useRef(false); // we've shown the generating UI

  // One animation loop: ease `shown` toward the target, creep the target while
  // we wait, and reveal the paper only once the bar has visibly filled.
  useEffect(() => {
    if (phase === "ready" || phase === "failed") return;
    const tick = setInterval(() => {
      if (!paperReadyRef.current && targetRef.current < 92) {
        targetRef.current = Math.min(92, targetRef.current + 0.8);
      }
      setShown((cur) => {
        const t = targetRef.current;
        const next = cur < t ? Math.min(t, cur + Math.max(0.9, (t - cur) * 0.18)) : cur;
        if (paperReadyRef.current && next >= 99.5) {
          // fully filled + paper in hand → reveal on the next frame
          queueMicrotask(() => setPhase("ready"));
        }
        return next;
      });
    }, 80);
    return () => clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    let active = true;

    const loadPaper = async () => {
      const p = await getPaper(id).catch(() => null);
      if (!active || !p) return false;
      setPaper(p);
      paperReadyRef.current = true;
      if (generatingRef.current) targetRef.current = 100; // let the bar finish, then reveal
      else setPhase("ready"); // revisiting an already-generated paper
      return true;
    };

    const enterGenerating = () => {
      generatingRef.current = true;
      setPhase((cur) => (cur === "ready" ? cur : "generating"));
    };

    const checkStatus = async () => {
      try {
        const a = await getAssignment(id);
        if (!active) return;
        if (a.status === "completed") await loadPaper();
        else if (a.status === "failed") {
          setPhase("failed");
          setError("The paper couldn't be generated. Try again.");
        } else enterGenerating();
      } catch {
        /* transient — keep polling */
      }
    };

    void (async () => {
      if (!(await loadPaper())) await checkStatus();
    })();

    const unsub = subscribeToAssignment(id, (s) => {
      if (!active) return;
      if (typeof s.progress === "number" && !paperReadyRef.current) {
        targetRef.current = Math.max(targetRef.current, Math.min(s.progress, 92));
      }
      if (s.status === "completed") void loadPaper();
      else if (s.status === "failed") {
        setPhase("failed");
        setError(s.error ?? "The paper couldn't be generated. Try again.");
      } else enterGenerating();
    });

    const poll = setInterval(() => {
      if (!paperReadyRef.current) void checkStatus();
    }, 3000);

    return () => {
      active = false;
      unsub();
      clearInterval(poll);
    };
  }, [id]);

  const regenerate = async () => {
    paperReadyRef.current = false;
    generatingRef.current = true;
    targetRef.current = 10;
    setShown(6);
    setError(null);
    setPhase("generating");
    await regenerateAssignment(id).catch(() => {
      setPhase("failed");
      setError("Couldn't start regeneration.");
    });
  };

  if (phase === "ready" && paper) {
    return <PaperView paper={paper} assignmentId={id} onRegenerate={regenerate} />;
  }

  if (phase === "failed") {
    return (
      <CenteredCard>
        <AlertTriangle size={40} className="text-[#C53535]" />
        <p className="text-[18px] font-bold text-ink">Generation failed</p>
        <p className="max-w-sm text-center text-[15px] text-ink-soft">{error}</p>
        <button
          type="button"
          onClick={regenerate}
          className="mt-2 flex h-11 items-center gap-2 rounded-full bg-[var(--color-dark)] px-6 text-[15px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          <RefreshCw size={18} />
          Try again
        </button>
      </CenteredCard>
    );
  }

  // active step follows the bar so steps light progressively and all complete at 100%
  const activeIndex = STEPS.reduce((acc, s, i) => (shown >= s.at ? i : acc), 0);

  return (
    <CenteredCard>
      <Loader2 size={38} className="animate-spin text-ink/70" />
      <p className="text-[18px] font-bold text-ink">Generating your question paper</p>

      <div className="mt-1 h-2 w-full max-w-[340px] overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#E86F22] to-[#303030] transition-[width] duration-150 ease-out"
          style={{ width: `${Math.round(shown)}%` }}
        />
      </div>
      <span className="text-[12px] font-medium tabular-nums text-ink-soft">{Math.round(shown)}%</span>

      <ol className="mt-3 flex flex-col gap-2.5">
        {STEPS.map((s, i) => {
          const done = shown >= 100 || i < activeIndex;
          const active = !done && i === activeIndex;
          return (
            <li key={s.label} className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                  done
                    ? "bg-[#1E9E5A] text-white"
                    : active
                      ? "bg-[var(--color-dark)] text-white"
                      : "bg-black/10 text-transparent"
                }`}
              >
                {done ? (
                  <Check size={12} strokeWidth={3} />
                ) : active ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#bdbdbd]" />
                )}
              </span>
              <span className={`text-[14px] ${done || active ? "font-medium text-ink" : "text-ink-soft"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </CenteredCard>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-rise mx-auto flex min-h-[60vh] w-full max-w-[1100px] flex-col items-center justify-center gap-3">
      {children}
    </div>
  );
}
