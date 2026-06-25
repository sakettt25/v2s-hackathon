"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getIssues } from "@/lib/data";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function askSituationRoom(query: string) {
  if (!genAI) {
    return { success: false, error: "AI Service is not configured. Missing GEMINI_API_KEY." };
  }
  
  try {
    const issues = await getIssues();
    
    // Create a summarized JSON of issues to avoid token limits
    const issuesSummary = issues.map(i => ({
      title: i.title,
      category: i.category,
      status: i.status,
      severity: i.severity_score,
      location: i.formatted_address,
      upvotes: i.upvote_count,
      createdAt: i.created_at
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are the AI Situation Room Commander for the 'ResoluCity' civic platform.
You have access to the following real-time database of civic issues reported by citizens:
${JSON.stringify(issuesSummary)}

Answer the user's query based ONLY on this data. 
Be concise, analytical, and professional. 
Format your response using Markdown. Use lists, bold text, and clear headings.
If they ask for recommendations or action plans, provide logical prioritization based on severity and upvotes.
`;

    const result = await model.generateContent([
      systemPrompt,
      `User query: ${query}`
    ]);

    const text = result.response.text();
    return { success: true, answer: text };
  } catch (error: any) {
    console.error("AI Command Error:", error);
    return { success: false, error: error.message || "Failed to process query with AI." };
  }
}
