import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

export type FilePart = { data: string; mimeType: string }; // data is base64

export interface LLMProvider {
  generateJSON(system: string, user: string, files?: FilePart[]): Promise<string>;
}

class GroqProvider implements LLMProvider {
  private client = new Groq({ apiKey: env.GROQ_API_KEY });

  async generateJSON(system: string, user: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: env.GROQ_MODEL,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
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
    const res = await model.generateContent(parts);
    return res.response.text();
  }
}

export const llm: LLMProvider =
  env.LLM_PROVIDER === "groq" ? new GroqProvider() : new GeminiProvider();
