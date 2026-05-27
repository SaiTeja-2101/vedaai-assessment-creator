"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, Check, Building2, X } from "lucide-react";
import { useProfile, logoUrl, type ProfileUpdate } from "@/lib/profile";

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[14px] font-bold text-ink">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border-[1.25px] border-[#DADADA] bg-white/60 px-4 text-[15px] font-medium text-ink transition-colors placeholder:text-[var(--color-disabled)] focus:border-[#c4c4c4] focus:outline-none"
      />
    </label>
  );
}

export default function SettingsPage() {
  const { profile, fetch, save } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    schoolName: "",
    address: "",
    city: "",
    board: "",
    teacherName: "",
    teacherRole: "",
  });
  const [logo, setLogo] = useState<{ mimeType: string; dataBase64: string } | null | undefined>(undefined);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      schoolName: profile.schoolName,
      address: profile.address,
      city: profile.city,
      board: profile.board,
      teacherName: profile.teacherName,
      teacherRole: profile.teacherRole,
    });
    setLogoPreview(logoUrl(profile));
  }, [profile]);

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const pickLogo = async (file?: File) => {
    if (!file || !LOGO_TYPES.includes(file.type)) return;
    const dataBase64 = await readAsBase64(file);
    setLogo({ mimeType: file.type, dataBase64 });
    setLogoPreview(`data:${file.type};base64,${dataBase64}`);
    setSaved(false);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const update: ProfileUpdate = { ...form };
      if (logo !== undefined) update.logo = logo;
      await save(update);
      setLogo(undefined);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.schoolName || "S").slice(0, 2).toUpperCase();

  return (
    <div className="animate-rise mx-auto flex w-full max-w-[760px] flex-col gap-6 pb-28">
      <div className="flex items-center gap-3 px-1">
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span className="absolute h-3 w-3 rounded-full bg-[#4BC26D]/40" />
          <span className="h-2 w-2 rounded-full bg-[#4BC26D]" />
        </span>
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold leading-[1.4] text-ink">Settings</h1>
          <p className="text-[14px] leading-[1.4] text-[rgba(94,94,94,0.55)]">
            Your institution and profile — used across the app and on every paper.
          </p>
        </div>
      </div>

      {/* Institution */}
      <section className="flex flex-col gap-5 rounded-[28px] bg-white/60 p-6 backdrop-blur-sm sm:p-8">
        <h2 className="text-[17px] font-bold text-ink">Institution</h2>

        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-offwhite-2)] text-[20px] font-bold text-[var(--color-muted)]">
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" width={80} height={80} className="h-full w-full object-cover" unoptimized />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={LOGO_TYPES.join(",")}
              className="hidden"
              onChange={(e) => void pickLogo(e.target.files?.[0])}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-10 items-center gap-2 rounded-full bg-[var(--color-dark)] px-4 text-[14px] font-medium text-white transition-transform active:scale-95"
              >
                <Upload size={16} />
                Upload logo
              </button>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setLogo(null);
                    setLogoPreview(null);
                    setSaved(false);
                  }}
                  className="flex h-10 items-center gap-1.5 rounded-full border border-black/10 px-4 text-[14px] font-medium text-ink transition-colors hover:bg-black/5"
                >
                  <X size={16} />
                  Remove
                </button>
              )}
            </div>
            <span className="text-[12px] text-ink-soft">PNG, JPEG or WebP.</span>
          </div>
        </div>

        <Field label="School Name" value={form.schoolName} onChange={set("schoolName")} placeholder="Delhi Public School" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Address" value={form.address} onChange={set("address")} placeholder="Sector-4, Bokaro" />
          <Field label="City" value={form.city} onChange={set("city")} placeholder="Bokaro Steel City" />
        </div>
        <Field label="Board / Affiliation" value={form.board} onChange={set("board")} placeholder="CBSE" />
      </section>

      {/* Teacher */}
      <section className="flex flex-col gap-5 rounded-[28px] bg-white/60 p-6 backdrop-blur-sm sm:p-8">
        <h2 className="text-[17px] font-bold text-ink">Your profile</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" value={form.teacherName} onChange={set("teacherName")} placeholder="Lakshya Sharma" />
          <Field label="Role" value={form.teacherRole} onChange={set("teacherRole")} placeholder="Teacher" />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex h-[46px] items-center gap-2 rounded-full bg-[var(--color-dark)] px-7 text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(24,24,24,0.22)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {saved ? <Check size={18} /> : <Building2 size={18} />}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
