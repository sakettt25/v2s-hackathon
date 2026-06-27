import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;
export const ai = new Proxy({} as GoogleGenAI, {
  get: (target, prop) => {
    if (!_ai) {
      if (!process.env.GEMINI_API_KEY) console.warn("GEMINI_API_KEY is not set.");
      _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" });
    }
    return (_ai as any)[prop];
  }
});

export const MODELS = {
  flash: "gemini-2.0-flash",
  pro: "gemini-1.5-pro",
  embedding: "text-embedding-004",
} as const;
