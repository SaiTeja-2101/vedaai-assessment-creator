"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw, Check } from "lucide-react";
import { getPaper, getAssignment, regenerateAssignment, type PaperData } from "@/lib/api";
import { subscribeToAssignment } from "@/lib/socket";
import PaperView from "./PaperView";

type Phase = "loading" | "generating" | "ready" | "failed";

export default function PaperScreen({ id }: { id: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState("Starting up…");
  const [shown, setShown] = useState(6);
  const [serverProgress, setServerProgress] = useState(0);

  const readyRef = useRef(false);
  const targetRef = useRef(8);

  // Smoothly ease the displayed bar toward the target, and creep the target up
  // to ~92% while we wait so the bar never looks frozen between server events.
  useEffect(() => {
    if (phase === "ready" || phase === "failed") return;
    const tick = setInterval(() => {
      if (targetRef.current < 92) targetRef.current = Math.min(92, targetRef.current + 0.7);
      setShown((cur) => {
        const t = targetRef.current;
        if (cur >= t) return cur;
        return Math.min(t, cur + Math.max(0.6, (t - cur) * 0.12));
      });
    }, 110);
    return () => clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    let active = true;

    const finish = () => {
      targetRef.current = 100;
      setShown(100);
    };

    const loadPaper = async () => {
      const p = await getPaper(id).catch(() => null);
      if (!active || !p) return false;
      readyRef.current = true;
      finish();
      setPaper(p);
      setPhase("ready");
      return true;
    };

    const checkStatus = async () => {
      try {
        const a = await getAssignment(id);
        if (!active) return;
        if (a.status === "completed") await loadPaper();
        else if (a.status === "failed") {
          setPhase("failed");
          setError("The paper couldn't be generated. Try again.");
        } else setPhase((cur) => (cur === "ready" ? cur : "generating"));
      } catch {
        /* transient — keep polling */
      }
    };

    void (async () => {
      if (!(await loadPaper())) await checkStatus();
    })();

    const unsub = subscribeToAssignment(id, (s) => {
      if (!active) return;
      if (typeof s.progress === "number") {
        targetRef.current = Math.max(targetRef.current, s.progress);
        setServerProgress((p) => Math.max(p, s.progress!));
      }
      if (s.stage) setStage(s.stage);
      if (s.status === "completed") void loadPaper();
      else if (s.status === "failed") {
        setPhase("failed");
        setError(s.error ?? "The paper couldn't be generated. Try again.");
      } else setPhase((cur) => (cur === "ready" ? cur : "generating"));
    });

    const poll = setInterval(() => {
      if (!readyRef.current) void checkStatus();
    }, 3000);

    return () => {
      active = false;
      unsub();
      clearInterval(poll);
    };
  }, [id]);

  const regenerate = async () => {
    readyRef.current = false;
    targetRef.current = 8;
    setShown(6);
    setServerProgress(0);
    setStage("Starting up…");
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

  const steps = [
    { label: "Analyzing your inputs", at: 10 },
    { label: "Drafting questions", at: 35 },
    { label: "Formatting & answer key", at: 75 },
    { label: "Finalizing", at: 90 },
  ];
  const activeIndex = steps.reduce((acc, s, i) => (serverProgress >= s.at ? i : acc), 0);

  return (
    <CenteredCard>
      <Loader2 size={38} className="animate-spin text-ink/70" />
      <p className="text-[18px] font-bold text-ink">Generating your question paper</p>

      <div className="mt-1 h-2 w-full max-w-[340px] overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#E86F22] to-[#303030] transition-[width] duration-200 ease-out"
          style={{ width: `${Math.round(shown)}%` }}
        />
      </div>
      <span className="text-[12px] font-medium tabular-nums text-ink-soft">{Math.round(shown)}%</span>

      <ol className="mt-3 flex flex-col gap-2.5">
        {steps.map((s, i) => {
          const done = i < activeIndex || serverProgress >= 100;
          const active = i === activeIndex && serverProgress < 100;
          return (
            <li key={s.label} className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                  done ? "bg-[#1E9E5A] text-white" : active ? "bg-[var(--color-dark)] text-white" : "bg-black/10 text-transparent"
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : active ? <Loader2 size={12} className="animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-[#bdbdbd]" />}
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
