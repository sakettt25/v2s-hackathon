"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getIssues } from "@/lib/data";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateSmartTriageAction() {
  if (!genAI) {
    return { success: false, error: "AI Service is not configured." };
  }

  try {
    const issues = await getIssues();
    const openIssues = issues.filter((i: any) => i.status !== "resolved");

    if (openIssues.length === 0) {
      return { success: true, triage: [] };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a smart city triage AI. Given a list of unresolved civic issues, rank them in order of priority. 
Consider: severity_score, category danger level, community upvotes, and time elapsed since report.

Issues:
${JSON.stringify(openIssues.map(i => ({
  id: i.id,
  title: i.title,
  category: i.category,
  severity: i.severity_score,
  status: i.status,
  upvotes: i.upvote_count,
  address: i.formatted_address,
  created: i.created_at
})))}

Return a JSON array of the top 5 most urgent issues (or fewer if less than 5 exist). Each item:
{ "id": "issue id", "title": "issue title", "urgency": "critical" or "high" or "medium", "reason": "1 sentence explaining why this is prioritized" }

Respond ONLY with the JSON array, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return { success: true, triage: JSON.parse(cleanedText) };
  } catch (error: any) {
    console.error("Smart Triage Error:", error);
    return { success: false, error: "Failed to generate triage." };
  }
}
