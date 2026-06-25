import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will be unavailable.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const MODELS = {
  flash: "gemini-2.0-flash",
  pro: "gemini-1.5-pro",
  embedding: "text-embedding-004",
} as const;
