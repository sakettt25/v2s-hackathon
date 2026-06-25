import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";

// This endpoint is designed to be called by a cron job (e.g., Vercel Cron or Supabase Edge Function Trigger)
// It autonomously scans for stale issues, generates an escalation plan, and updates the database.
export async function GET(req: Request) {
  try {
    // Optional: Add a secret key check for cron jobs to secure the endpoint
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // 1. Fetch all open issues older than 5 days with severity > 5
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

    const { data: staleIssues, error } = await supabase
      .from("issues")
      .select("id, title, description, category, severity_score, created_at, upvote_count, formatted_address, verifications(id)")
      .eq("status", "open")
      .lt("created_at", fiveDaysAgo)
      .gt("severity_score", 5)
      .order("created_at", { ascending: true })
      .limit(5);

    if (error) {
      throw new Error("Database query failed");
    }

    if (!staleIssues || staleIssues.length === 0) {
      return NextResponse.json({ success: true, message: "No critical stale issues requiring autonomous escalation." });
    }

    // 2. Enrich with computed fields
    const enriched = staleIssues.map((issue: any) => ({
      ...issue,
      days_open: Math.ceil((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      verification_count: issue.verifications?.length || 0,
      community_pressure: ((issue.upvote_count || 0) + (issue.verifications?.length || 0)) *
        Math.ceil((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    // 3. Prompt Gemini to act as an Autonomous Agent
    const prompt = `
You are an autonomous AI civic agent for a platform in India.
You have detected the following CRITICAL STALE ISSUES that have been ignored for > 5 days.

STALE ISSUES:
${enriched.map((issue: any, i: number) => `
[${i + 1}] ID: ${issue.id}
Title: "${issue.title}"
Category: ${issue.category}
Location: ${issue.formatted_address || "Unknown"}
Severity: ${issue.severity_score}/10
Days Open: ${issue.days_open}
Community Pressure Score: ${issue.community_pressure}
`).join("")}

For each issue, you must decide whether to automatically escalate it to "in-progress" by simulating an emergency municipal dispatch.
Return a JSON array of escalation objects:
- id: the issue ID
- escalate: boolean (true if community pressure > 10 or severity > 7, false otherwise)
- action_note: A short sentence explaining the autonomous action taken (e.g., "Auto-escalated to PWD due to high severity and days open.")
`;

    const response = await ai.models.generateContent({
      model: MODELS.flash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              escalate: { type: "BOOLEAN" },
              action_note: { type: "STRING" },
            },
            required: ["id", "escalate", "action_note"],
          },
        },
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new Error("Empty AI response");
    }

    const decisions = JSON.parse(response.text);
    const escalatedIds = [];

    // 4. Autonomously execute the decisions in the database
    for (const decision of decisions) {
      if (decision.escalate) {
        // Update issue status
        await supabase
          .from("issues")
          .update({ status: "in-progress" })
          .eq("id", decision.id);
          
        // Log the autonomous official action
        await supabase
          .from("official_actions")
          .insert({
            issue_id: decision.id,
            official_id: "00000000-0000-0000-0000-000000000000", // System/Agent ID
            action_type: "escalated",
            updates: `[AUTONOMOUS AI AGENT]: ${decision.action_note}`
          });
          
        escalatedIds.push(decision.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Autonomous agent ran successfully. Escalated ${escalatedIds.length} issues.`,
      escalated_ids: escalatedIds
    });

  } catch (error: any) {
    console.error("Auto-Escalation Agent Error:", error);
    return NextResponse.json({ error: error.message || "Agent failed" }, { status: 500 });
  }
}
