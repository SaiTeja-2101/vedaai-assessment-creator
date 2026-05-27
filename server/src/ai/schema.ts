import { z } from "zod";

export const paperSchema = z.object({
  schoolName: z.string().default("Delhi Public School, Sector-4, Bokaro"),
  subject: z.string(),
  className: z.string(),
  durationMins: z.coerce.number().int().positive(),
  totalMarks: z.coerce.number().int().positive(),
  generalInstructions: z.string(),
  sections: z
    .array(
      z.object({
        name: z.string(),
        title: z.string(),
        instruction: z.string().default(""),
        questions: z
          .array(
            z.object({
              text: z.string().min(1),
              difficulty: z.enum(["easy", "moderate", "challenging"]),
              marks: z.coerce.number().int().positive(),
            })
          )
          .min(1),
      })
    )
    .min(1),
  answerKey: z
    .array(z.object({ n: z.coerce.number().int(), answer: z.string() }))
    .default([]),
});

export type GeneratedPaper = z.infer<typeof paperSchema>;

// Groq's json_object mode returns clean JSON, but strip stray fences just in case.
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("No JSON object found in model output");
  }
}
