import { Router } from "express";
import { z } from "zod";
import { Profile } from "../models/Profile.js";

export const profileRouter = Router();

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

async function getOrCreate() {
  const existing = await Profile.findOne();
  return existing ?? (await Profile.create({}));
}

function serialize(p: InstanceType<typeof Profile>) {
  return {
    schoolName: p.schoolName,
    address: p.address,
    city: p.city,
    board: p.board,
    teacherName: p.teacherName,
    teacherRole: p.teacherRole,
    hasLogo: !!p.get("logo")?.data,
    updatedAt: (p.get("updatedAt") as Date)?.toISOString() ?? "",
  };
}

const updateSchema = z.object({
  schoolName: z.string().trim().max(120).optional(),
  address: z.string().trim().max(160).optional(),
  city: z.string().trim().max(120).optional(),
  board: z.string().trim().max(80).optional(),
  teacherName: z.string().trim().max(80).optional(),
  teacherRole: z.string().trim().max(80).optional(),
  logo: z
    .object({ mimeType: z.enum(ACCEPTED as [string, ...string[]]), dataBase64: z.string().min(1) })
    .nullable()
    .optional(),
});

profileRouter.get("/", async (_req, res) => {
  res.json(serialize(await getOrCreate()));
});

profileRouter.put("/", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });

  const p = await getOrCreate();
  const { logo, ...fields } = parsed.data;
  Object.assign(p, fields);
  if (logo === null) p.set("logo", undefined);
  else if (logo) p.set("logo", { data: Buffer.from(logo.dataBase64, "base64"), mimeType: logo.mimeType });
  await p.save();

  res.json(serialize(p));
});

profileRouter.get("/logo", async (_req, res) => {
  const p = await Profile.findOne().select("logo");
  const logo = p?.get("logo") as { data: Buffer; mimeType: string } | undefined;
  if (!logo?.data) return res.status(404).end();
  res.setHeader("Content-Type", logo.mimeType);
  res.setHeader("Cache-Control", "no-cache");
  res.send(logo.data);
});
