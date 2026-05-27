import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

export type FilePart = { data: string; mimeType: string }; // data is base64

export interface LLMProvider {
  generateJSON(system: string, user: string, files?: FilePart[]): Promise<string>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(err: unknown): boolean {
  const m = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return m.includes("503") || m.includes("500") || m.includes("overload") || m.includes("unavailable") || m.includes("timeout");
}

class GroqProvider implements LLMProvider {
  private client = new Groq({ apiKey: env.GROQ_API_KEY });

  async generateJSON(system: string, user: string, files: FilePart[] = []): Promise<string> {
    const image = files.find((f) => f.mimeType.startsWith("image/"));
    const run = () => (image ? this.vision(system, user, image) : this.text(system, user));

    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await run();
      } catch (err) {
        lastErr = err;
        if (!isTransient(err)) throw err;
        await sleep(700);
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("Groq request failed");
  }

  private async text(system: string, user: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: env.GROQ_MODEL,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }

  private async vision(system: string, user: string, image: FilePart): Promise<string> {
    // Vision model: send the image inline; rely on the JSON-strict prompt + parser
    // (some vision models reject response_format).
    const res = await this.client.chat.completions.create({
      model: env.GROQ_VISION_MODEL,
      temperature: 0.5,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: user },
            { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data}` } },
          ],
        },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }
}

class GeminiProvider implements LLMProvider {
  private client = new GoogleGenerativeAI(env.GEMINI_API_KEY ?? "");

  async generateJSON(system: string, user: string, files: FilePart[] = []): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: system,
      generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
    });
    const parts = [
      { text: user },
      ...files.map((f) => ({ inlineData: { data: f.data, mimeType: f.mimeType } })),
    ];
    return (await model.generateContent(parts)).response.text();
  }
}

export const llm: LLMProvider =
  env.LLM_PROVIDER === "gemini" ? new GeminiProvider() : new GroqProvider();
