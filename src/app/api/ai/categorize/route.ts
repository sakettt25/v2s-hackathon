import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;

    let imagePart = null;
    if (file) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      imagePart = {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      };
    }

    const prompt = `
      Analyze the provided issue report description and image (if provided).
      Return a structured JSON response categorizing the issue.
      
      Requirements:
      - category: MUST be one of: pothole, water_leak, broken_streetlight, garbage, road_damage, drainage, electrical, illegal_dumping, noise_complaint, other
      - severity_score: Integer from 1 to 10 (1 = trivial, 10 = critical life safety hazard)
      - suggested_title: A clear, concise title (max 50 chars)
      - summary: A brief 1-2 sentence summary of the core problem
      - tags: Array of 2-4 relevant keywords
      
      Description provided by user: "${description || "No description provided."}"
    `;

    const contents = imagePart ? [prompt, imagePart] : [prompt];

    const response = await ai.models.generateContent({
      model: MODELS.flash,
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING" },
            severity_score: { type: "INTEGER" },
            suggested_title: { type: "STRING" },
            summary: { type: "STRING" },
            tags: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["category", "severity_score", "suggested_title", "summary", "tags"],
        },
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    const structuredData = JSON.parse(response.text);
    return NextResponse.json(structuredData);
  } catch (error: any) {
    console.error("AI Categorization Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze" }, { status: 500 });
  }
}
