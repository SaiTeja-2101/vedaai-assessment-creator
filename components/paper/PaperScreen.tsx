"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { getPaper, getAssignment, regenerateAssignment, type PaperData } from "@/lib/api";
import { subscribeToAssignment } from "@/lib/socket";
import PaperView from "./PaperView";

type Phase = "loading" | "generating" | "ready" | "failed";

export default function PaperScreen({ id }: { id: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    let active = true;

    const loadPaper = async () => {
      const p = await getPaper(id).catch(() => null);
      if (!active || !p) return false;
      readyRef.current = true;
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
    setError(null);
    setPhase("generating");
    await regenerateAssignment(id).catch(() => {
      setPhase("failed");
      setError("Couldn't start regeneration.");
    });
  };

  if (phase === "ready" && paper) {
    return <PaperView paper={paper} onRegenerate={regenerate} />;
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

  return (
    <CenteredCard>
      <Loader2 size={40} className="animate-spin text-ink/70" />
      <p className="text-[18px] font-bold text-ink">Generating your question paper…</p>
      <p className="max-w-sm text-center text-[15px] text-ink-soft">
        The AI is drafting sections, questions and an answer key. This usually takes a few seconds.
      </p>
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
