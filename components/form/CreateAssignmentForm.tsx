"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, ArrowLeft, ArrowRight, Mic } from "lucide-react";
import {
  useAssignmentDraft,
  totalsFor,
  QUESTION_TYPES,
  type QuestionRow,
} from "@/lib/store";
import Stepper from "./Stepper";
import Dropdown from "./Dropdown";
import FileDropzone from "./FileDropzone";
import DueDateField from "./DueDateField";
import ProgressSteps from "./ProgressSteps";

export default function CreateAssignmentForm() {
  const router = useRouter();
  const {
    fileName,
    dueDate,
    rows,
    additionalInfo,
    setFileName,
    setDueDate,
    addRow,
    removeRow,
    updateRow,
    setAdditionalInfo,
  } = useAssignmentDraft();

  const [showErrors, setShowErrors] = useState(false);
  const { totalQuestions, totalMarks } = totalsFor(rows);
  const usedTypes = rows.map((r) => r.type);

  const dueDateInvalid = showErrors && !dueDate;
  const noRows = rows.length === 0;
  const canAddMore = rows.length < QUESTION_TYPES.length;

  const handleNext = () => {
    setShowErrors(true);
    if (!dueDate || noRows) return;
    // Backend wiring (enqueue generation) lands in the backend phase.
    // For now persist the draft (already in the store) and advance.
    router.push("/assignments");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1103px] flex-col items-center gap-8">
      {/* Page header */}
      <div className="flex w-full items-center gap-3 px-1">
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span className="absolute h-3 w-3 rounded-full bg-[#4BC26D]/40" />
          <span className="h-2 w-2 rounded-full bg-[#4BC26D]" />
        </span>
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold leading-[1.4] text-ink">
            Create Assignment
          </h1>
          <p className="text-[14px] leading-[1.4] text-[rgba(94,94,94,0.55)]">
            Set up a new assignment for your students
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full px-1">
        <ProgressSteps current={1} total={2} />
      </div>

      {/* Card */}
      <div className="flex w-full max-w-[810px] flex-col gap-8 rounded-[32px] bg-white/50 p-6 backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[20px] font-bold leading-[1.4] text-ink">
            Assignment Details
          </h2>
          <p className="text-[14px] leading-[1.4] text-ink-soft">
            Basic information about your assignment
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Upload */}
          <div className="flex flex-col gap-3">
            <FileDropzone fileName={fileName} onFile={setFileName} />
            <p className="text-center text-[16px] font-medium text-[rgba(48,48,48,0.6)]">
              Upload images of your preferred document/image
            </p>
          </div>

          {/* Due date */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-ink">Due Date</label>
            <DueDateField value={dueDate} onChange={setDueDate} invalid={dueDateInvalid} />
            {dueDateInvalid && (
              <span className="text-[13px] font-medium text-red-500">
                Please pick a due date.
              </span>
            )}
          </div>

          {/* Question types */}
          <div className="flex flex-col gap-4">
            {/* Desktop: table layout */}
            <div className="hidden lg:block">
              <div className="mb-4 flex items-center">
                <span className="flex-1 text-[16px] font-bold text-ink">
                  Question Type
                </span>
                <span className="w-[150px] text-center text-[16px] font-medium text-ink">
                  No. of Questions
                </span>
                <span className="w-[100px] text-center text-[16px] font-medium text-ink">
                  Marks
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {rows.map((row) => (
                  <div key={row.id} className="flex items-center gap-3">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex-1">
                        <Dropdown
                          value={row.type}
                          options={QUESTION_TYPES}
                          disabledOptions={usedTypes}
                          onChange={(type) => updateRow(row.id, { type })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        aria-label="Remove question type"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5"
                      >
                        <X size={16} strokeWidth={2} />
                      </button>
                    </div>
                    <div className="flex w-[150px] justify-center">
                      <Stepper
                        value={row.count}
                        onChange={(count) => updateRow(row.id, { count })}
                      />
                    </div>
                    <div className="flex w-[100px] justify-center">
                      <Stepper
                        value={row.marks}
                        onChange={(marks) => updateRow(row.id, { marks })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: stacked cards */}
            <div className="flex flex-col gap-4 lg:hidden">
              <span className="text-[16px] font-bold text-ink">Question Type</span>
              {rows.map((row) => (
                <MobileQuestionCard
                  key={row.id}
                  row={row}
                  usedTypes={usedTypes}
                  onChange={(patch) => updateRow(row.id, patch)}
                  onRemove={() => removeRow(row.id)}
                />
              ))}
            </div>

            {noRows && showErrors && (
              <span className="text-[13px] font-medium text-red-500">
                Add at least one question type.
              </span>
            )}

            {/* Add + totals */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <button
                type="button"
                onClick={addRow}
                disabled={!canAddMore}
                className="flex items-center gap-2 self-start disabled:opacity-40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B2B2B] transition-transform active:scale-95">
                  <Plus size={20} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[14px] font-bold text-ink">Add Question Type</span>
              </button>

              <div className="flex flex-col gap-2 lg:items-end">
                <span className="text-[16px] font-medium leading-[1.1] text-ink">
                  Total Questions&nbsp;: {totalQuestions}
                </span>
                <span className="text-[16px] font-medium leading-[1.1] text-ink">
                  Total Marks&nbsp;: {totalMarks}
                </span>
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-bold text-ink">
              Additional Information (For better output)
            </label>
            <div className="relative rounded-2xl border-[1.25px] border-dashed border-[#DADADA] bg-white/25 p-4">
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                rows={2}
                className="w-full resize-none bg-transparent pr-12 text-[14px] font-medium text-ink placeholder:text-[rgba(48,48,48,0.6)] focus:outline-none"
              />
              <button
                type="button"
                aria-label="Voice input"
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-offwhite-2)] text-ink transition-colors hover:bg-[#e6e6e6]"
              >
                <Mic size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex w-full max-w-[810px] items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-[46px] items-center gap-1 rounded-full bg-white px-6 text-[16px] font-medium text-ink shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-transform hover:scale-[1.02] active:scale-95"
        >
          <ArrowLeft size={20} />
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex h-[46px] items-center gap-1 rounded-full bg-[var(--color-dark)] px-6 text-[16px] font-medium text-white shadow-[0_10px_24px_rgba(24,24,24,0.22)] transition-transform hover:scale-[1.02] active:scale-95"
        >
          Next
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

/** Mobile per-type card: label row + a grey box holding the two steppers. */
function MobileQuestionCard({
  row,
  usedTypes,
  onChange,
  onRemove,
}: {
  row: QuestionRow;
  usedTypes: string[];
  onChange: (patch: Partial<Omit<QuestionRow, "id">>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Dropdown
            value={row.type}
            options={QUESTION_TYPES}
            disabledOptions={usedTypes}
            onChange={(type) => onChange({ type })}
            size="mobile"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove question type"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-3xl bg-[var(--color-offwhite-2)] p-2">
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[14px] font-medium text-ink">No. of Questions</span>
          <Stepper
            value={row.count}
            onChange={(count) => onChange({ count })}
            size="mobile"
          />
        </div>
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[14px] font-medium text-ink">Marks</span>
          <Stepper
            value={row.marks}
            onChange={(marks) => onChange({ marks })}
            size="mobile"
          />
        </div>
      </div>
    </div>
  );
}
