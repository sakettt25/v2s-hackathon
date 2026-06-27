"use server";

import { analyzeIssueImage } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function analyzeImageAction(base64Image: string) {
  try {
    const aiResult = await analyzeIssueImage(base64Image);
    return { success: true, data: aiResult };
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return { success: false, error: "Failed to analyze image with AI." };
  }
}

// AI Duplicate Detection — checks existing issues for semantic similarity
export async function checkDuplicatesAction(title: string, description: string, category: string, lat: number, lng: number) {
  if (!genAI) {
    return { success: true, duplicates: [] }; // Gracefully skip if no AI key
  }

  try {
    const supabase = await createClient();

    // Fetch recent open issues in the same category within a rough proximity
    const { data: existingIssues } = await supabase
      .from("issues")
      .select("id, title, description, category, status, lat, lng, formatted_address, severity_score")
      .in("status", ["open", "verifying"])
      .limit(30);

    if (!existingIssues || existingIssues.length === 0) {
      return { success: true, duplicates: [] };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a civic issue deduplication engine.

A citizen is reporting a NEW issue:
Title: "${title}"
Description: "${description}"
Category: "${category}"
Location: lat ${lat}, lng ${lng}

Here are EXISTING issues in the system:
${JSON.stringify(existingIssues.map(i => ({ id: i.id, title: i.title, description: i.description, category: i.category, lat: i.lat, lng: i.lng, address: i.formatted_address })))}

Identify any existing issues that are likely DUPLICATES of the new report (same problem, nearby location within ~500m).
Return a JSON array of matches. Each match should have:
{ "id": "existing issue id", "title": "existing issue title", "confidence": "high" or "medium", "reason": "1 sentence explanation" }

If no duplicates, return an empty array [].
Respond ONLY with the JSON array, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const duplicates = JSON.parse(cleanedText);

    return { success: true, duplicates };
  } catch (error: any) {
    console.error("Duplicate Detection Error:", error);
    return { success: true, duplicates: [] }; // Don't block submission on AI failure
  }
}

export async function submitIssueAction(payload: {
  title: string;
  description: string;
  category: string;
  severity_score: number;
  lat: number;
  lng: number;
  formatted_address: string;
  image_data?: string;
}) {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("issues")
    .insert({
      reporter_id: session.user.id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      severity_score: payload.severity_score,
      lat: payload.lat,
      lng: payload.lng,
      formatted_address: payload.formatted_address,
      status: "open",
      image_data: payload.image_data,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Insert Error:", JSON.stringify(error));
    return { success: false, error: `Failed to submit issue: ${error.message || error.code || "Unknown DB error"}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/leaderboard");

  return { success: true, issueId: data.id };
}
