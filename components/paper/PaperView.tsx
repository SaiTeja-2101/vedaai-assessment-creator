"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import type { Difficulty, QuestionPaper } from "@/lib/paper";
import { PAPER_INTRO } from "@/lib/paper";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

export default function PaperView({
  paper,
  onRegenerate,
}: {
  paper: QuestionPaper;
  onRegenerate?: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  // Continuous question numbering across sections (answer key aligns to it).
  let counter = 0;

  return (
    <div className="animate-rise mx-auto w-full max-w-[1100px]">
      {/* Outer frame: grey on desktop, white on mobile */}
      <div className="flex flex-col gap-3 rounded-[40px] bg-white p-2.5 lg:rounded-[32px] lg:bg-[#5E5E5E] lg:p-5">
        {/* AI banner */}
        <div className="no-print flex flex-col items-start gap-4 rounded-[28px] bg-[#303030] p-5 lg:rounded-[32px] lg:bg-[#181818]/90 lg:px-8 lg:py-6">
          <p className="text-[15px] font-bold leading-[1.4] text-white lg:text-[20px]">
            {PAPER_INTRO}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={downloading}
              onClick={async () => {
                setDownloading(true);
                try {
                  const { downloadPaperPdf } = await import("./paperPdf");
                  const name = `${paper.subject}-${paper.className}`
                    .replace(/[^\w]+/g, "-")
                    .toLowerCase();
                  await downloadPaperPdf(paper, `${name || "question-paper"}.pdf`);
                } finally {
                  setDownloading(false);
                }
              }}
              className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[#303030] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
              <Download size={20} />
              <span className="text-[16px] font-medium">
                {downloading ? "Preparing…" : "Download as PDF"}
              </span>
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex h-11 items-center gap-2 rounded-full border border-white/30 px-6 text-white transition-colors hover:bg-white/10"
              >
                <RefreshCw size={18} />
                <span className="text-[16px] font-medium">Regenerate</span>
              </button>
            )}
          </div>
        </div>

        {/* The paper itself */}
        <div
          className="printable flex flex-col gap-6 rounded-[28px] bg-[#F6F6F6] p-6 lg:rounded-[32px] lg:bg-white lg:p-10"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {/* School header */}
          <header className="text-center leading-[1.5] text-ink">
            <h1 className="text-[20px] font-bold lg:text-[30px]">{paper.schoolName}</h1>
            <p className="text-[16px] font-semibold lg:text-[20px]">Subject: {paper.subject}</p>
            <p className="text-[16px] font-semibold lg:text-[20px]">Class: {paper.className}</p>
          </header>

          {/* Time / Marks */}
          <div className="flex items-center justify-between gap-2 text-[14px] font-semibold text-ink lg:text-[18px]">
            <span>Time Allowed: {paper.durationMins} minutes</span>
            <span>Maximum Marks: {paper.totalMarks}</span>
          </div>

          <p className="text-[14px] font-semibold text-ink lg:text-[18px]">
            {paper.generalInstructions}
          </p>

          {/* Student info */}
          <div className="flex flex-col gap-1 text-[14px] font-semibold text-ink lg:text-[18px]">
            <span>Name: ______________________</span>
            <span>Roll Number: ________________</span>
            <span>Class: {paper.className} &nbsp;&nbsp;Section: __________</span>
          </div>

          {/* Sections */}
          {paper.sections.map((section) => (
            <section key={section.name} className="flex flex-col gap-4">
              <h2 className="text-center text-[18px] font-semibold text-ink lg:text-[24px]">
                {section.name}
              </h2>
              <p className="text-[14px] font-semibold text-ink lg:text-[18px]">
                {section.title} —{" "}
                <span className="italic font-medium">{section.instruction}</span>
              </p>

              <ol className="flex flex-col gap-3.5">
                {section.questions.map((q) => {
                  counter += 1;
                  const n = counter;
                  return (
                    <li key={n} className="flex gap-2.5 text-[14px] leading-relaxed text-ink lg:text-[16px]">
                      <span className="font-semibold tabular-nums">{n}.</span>
                      <span className="flex-1">
                        [{DIFFICULTY_LABEL[q.difficulty]}] {q.text}{" "}
                        <span className="whitespace-nowrap">[{q.marks} Marks]</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

          {/* End divider */}
          <p className="text-center text-[14px] font-semibold tracking-wide text-[#5E5E5E] lg:text-[16px]">
            — End of Question Paper —
          </p>

          {/* Answer Key */}
          <div className="flex flex-col gap-3 border-t border-black/10 pt-6">
            <h2 className="text-[16px] font-bold text-ink lg:text-[20px]">Answer Key</h2>
            <ol className="flex flex-col gap-2.5">
              {paper.answerKey.map((a) => (
                <li key={a.n} className="flex gap-2.5 text-[14px] leading-relaxed text-ink lg:text-[16px]">
                  <span className="font-semibold tabular-nums">{a.n}.</span>
                  <span className="flex-1 whitespace-pre-line">{a.answer}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
