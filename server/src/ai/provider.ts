import Groq from "groq-sdk";
import { env } from "../config/env.js";

export interface LLMProvider {
  generateJSON(system: string, user: string): Promise<string>;
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

export const llm: LLMProvider = new GroqProvider();
