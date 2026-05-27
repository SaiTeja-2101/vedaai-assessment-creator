import { create } from "zustand";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Profile = {
  schoolName: string;
  address: string;
  city: string;
  board: string;
  teacherName: string;
  teacherRole: string;
  hasLogo: boolean;
  updatedAt: string;
};

export type ProfileUpdate = Partial<Omit<Profile, "hasLogo" | "updatedAt">> & {
  logo?: { mimeType: string; dataBase64: string } | null;
};

export function logoUrl(p: Profile | null): string | null {
  if (!p?.hasLogo) return null;
  return `${BASE}/api/profile/logo?v=${encodeURIComponent(p.updatedAt)}`;
}

async function getProfile(): Promise<Profile> {
  const res = await fetch(`${BASE}/api/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

async function saveProfile(update: ProfileUpdate): Promise<Profile> {
  const res = await fetch(`${BASE}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

type ProfileState = {
  profile: Profile | null;
  loaded: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  save: (update: ProfileUpdate) => Promise<void>;
};

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  loaded: false,
  loading: false,
  fetch: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ profile: await getProfile(), loaded: true });
    } catch {
      /* ignore — keep defaults */
    } finally {
      set({ loading: false });
    }
  },
  save: async (update) => {
    set({ profile: await saveProfile(update), loaded: true });
  },
}));
