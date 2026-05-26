"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";

type FileDropzoneProps = {
  fileName: string | null;
  onFile: (name: string | null) => void;
};

const ACCEPT = "image/jpeg,image/png,application/pdf";

/**
 * Dashed upload area. Accepts click-to-browse and drag & drop. We only track
 * the file name in state for now; the actual upload is wired in the backend phase.
 */
export default function FileDropzone({ fileName, onFile }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) onFile(files[0].name);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center gap-4 rounded-3xl border-[1.75px] border-dashed bg-white px-8 py-6 text-center transition-colors lg:min-h-[202px] ${
        dragging ? "border-orange bg-orange/[0.03]" : "border-black/20"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {fileName ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-offwhite)] px-4 py-3">
          <FileCheck2 size={22} className="text-orange" />
          <span className="max-w-[360px] truncate text-[15px] font-medium text-ink">
            {fileName}
          </span>
          <button
            type="button"
            onClick={() => {
              onFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="Remove file"
            className="flex h-6 w-6 items-center justify-center rounded-full text-[#9a9a9a] transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <UploadCloud size={24} strokeWidth={2.5} className="text-[#1E1E1E]" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-medium text-ink">
              Choose a file or drag &amp; drop it here
            </p>
            <p className="text-[14px] text-[var(--color-disabled)]">
              JPEG, PNG, upto 10MB
            </p>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full bg-[var(--color-offwhite)] px-6 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-[#ededed]"
      >
        Browse Files
      </button>
    </div>
  );
}
