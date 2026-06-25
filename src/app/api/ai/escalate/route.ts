import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Fetch all open issues older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: staleIssues, error } = await supabase
      .from("issues")
      .select("id, title, description, category, severity_score, created_at, upvote_count, formatted_address, verifications(id)")
      .eq("status", "open")
      .lt("created_at", threeDaysAgo)
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) {
      throw new Error("Database query failed");
    }

    if (!staleIssues || staleIssues.length === 0) {
      return NextResponse.json({ success: true, escalations: [] });
    }

    // Enrich with computed fields
    const enriched = staleIssues.map((issue: any) => ({
      ...issue,
      days_open: Math.ceil((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      verification_count: issue.verifications?.length || 0,
      community_pressure: ((issue.upvote_count || 0) + (issue.verifications?.length || 0)) *
        Math.ceil((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    const prompt = `
You are an AI escalation advisor for a civic issue tracking platform in India.

The following issues have been OPEN for more than 3 days with no resolution. Analyze each and generate escalation recommendations.

STALE ISSUES:
${enriched.map((issue: any, i: number) => `
[${i + 1}] ID: ${issue.id}
Title: "${issue.title}"
Category: ${issue.category}
Description: "${issue.description}"
Location: ${issue.formatted_address || "Unknown"}
Severity: ${issue.severity_score}/10
Days Open: ${issue.days_open}
Community Verifications: ${issue.verification_count}
Community Pressure Score: ${issue.community_pressure}
`).join("")}

For each issue, generate a JSON array of escalation objects:
- id: the issue ID
- title: the issue title
- days_open: days the issue has been open
- severity: the severity score
- community_pressure: the pressure score
- urgency: "critical", "high", or "medium"
- justification: 1-2 sentence AI-generated reason explaining WHY this issue needs immediate escalation (reference specific data like days open, severity, community pressure)
- recommended_action: A specific, actionable next step (e.g., "Deploy PWD road repair crew within 24 hours", "Escalate to Ward Councillor for emergency sanction")
- target_authority: The specific Indian government authority/department to escalate to

Sort by urgency (critical first), then by community_pressure descending.
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
              title: { type: "STRING" },
              days_open: { type: "INTEGER" },
              severity: { type: "INTEGER" },
              community_pressure: { type: "INTEGER" },
              urgency: { type: "STRING" },
              justification: { type: "STRING" },
              recommended_action: { type: "STRING" },
              target_authority: { type: "STRING" },
            },
            required: ["id", "title", "days_open", "urgency", "justification", "recommended_action", "target_authority"],
          },
        },
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error("Empty AI response");
    }

    const escalations = JSON.parse(response.text);
    return NextResponse.json({ success: true, escalations });

  } catch (error: any) {
    console.error("Escalation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate escalations" }, { status: 500 });
  }
}
