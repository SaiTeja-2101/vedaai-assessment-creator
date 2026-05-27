"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";
import type { UploadedFile } from "@/lib/store";

type FileDropzoneProps = {
  file: { name: string } | null;
  onFile: (file: UploadedFile | null) => void;
};

const ACCEPT = "image/jpeg,image/png,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function FileDropzone({ file, onFile }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const picked = files?.[0];
    if (!picked) return;
    setError(null);
    if (!["application/pdf", "image/png", "image/jpeg"].includes(picked.type)) {
      setError("Please upload a PDF, PNG or JPEG.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("File must be under 10MB.");
      return;
    }
    onFile({ name: picked.name, mimeType: picked.type, dataBase64: await readAsBase64(picked) });
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
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
          onChange={(e) => void handleFiles(e.target.files)}
        />

        {file ? (
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-offwhite)] px-4 py-3">
            <FileCheck2 size={22} className="text-orange" />
            <span className="max-w-[360px] truncate text-[15px] font-medium text-ink">
              {file.name}
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
              <p className="text-[14px] text-[var(--color-disabled)]">JPEG, PNG, PDF · up to 10MB</p>
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
      {error && <span className="text-[13px] font-medium text-red-500">{error}</span>}
    </div>
  );
}
