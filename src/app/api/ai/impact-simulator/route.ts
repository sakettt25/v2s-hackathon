import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Fetch all open issues with their categories and severity
    const { data: openIssues, error } = await supabase
      .from("issues")
      .select("id, title, category, severity_score, formatted_address, description")
      .eq("status", "open");

    if (error) {
      throw new Error("Database query failed");
    }

    if (!openIssues || openIssues.length === 0) {
      return NextResponse.json({ success: true, impact: null, message: "No open issues to analyze." });
    }

    // Group by category for summary
    const categoryBreakdown: Record<string, number> = {};
    openIssues.forEach((issue: any) => {
      categoryBreakdown[issue.category] = (categoryBreakdown[issue.category] || 0) + 1;
    });

    const prompt = `
You are an AI civic impact analyst for a municipal platform in India. You have access to real reported community issues.

CURRENT OPEN ISSUES SUMMARY:
Total: ${openIssues.length}
Category breakdown: ${JSON.stringify(categoryBreakdown)}

INDIVIDUAL ISSUES:
${openIssues.slice(0, 15).map((issue: any, i: number) => `
[${i + 1}] "${issue.title}" — Category: ${issue.category}, Severity: ${issue.severity_score}/10, Location: ${issue.formatted_address || "N/A"}
`).join("")}

Based on this REAL data, compute the projected civic impact of resolving ALL open issues. Use realistic Indian urban context (Delhi NCR).

Return a JSON object with:
- safety_impact: object with "metric" (e.g., "23% estimated reduction in road accidents on affected routes"), "affected_population" (number of residents impacted), "detail" (1 sentence explanation)
- environmental_impact: object with "metric" (e.g., "~18,000 liters/day water savings"), "co2_reduction_kg" (number), "detail" (1 sentence)
- economic_impact: object with "metric" (e.g., "₹4.2L estimated property value improvement"), "cost_of_inaction_inr" (string, daily cost of NOT fixing), "detail" (1 sentence)
- health_impact: object with "metric" (e.g., "Reduced disease vector exposure for ~800 residents"), "risk_reduction_percent" (number), "detail" (1 sentence)
- overall_summary: A compelling 2-sentence summary a mayor could use in a press briefing about the platform's impact
- efficiency_score: Integer 1-100, how efficiently the city is addressing reported issues based on the data

Be specific, reference actual issue categories from the data, and use realistic Indian urban statistics.
`;

    const response = await ai.models.generateContent({
      model: MODELS.flash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            safety_impact: {
              type: "OBJECT",
              properties: {
                metric: { type: "STRING" },
                affected_population: { type: "INTEGER" },
                detail: { type: "STRING" },
              },
              required: ["metric", "affected_population", "detail"],
            },
            environmental_impact: {
              type: "OBJECT",
              properties: {
                metric: { type: "STRING" },
                co2_reduction_kg: { type: "INTEGER" },
                detail: { type: "STRING" },
              },
              required: ["metric", "co2_reduction_kg", "detail"],
            },
            economic_impact: {
              type: "OBJECT",
              properties: {
                metric: { type: "STRING" },
                cost_of_inaction_inr: { type: "STRING" },
                detail: { type: "STRING" },
              },
              required: ["metric", "cost_of_inaction_inr", "detail"],
            },
            health_impact: {
              type: "OBJECT",
              properties: {
                metric: { type: "STRING" },
                risk_reduction_percent: { type: "INTEGER" },
                detail: { type: "STRING" },
              },
              required: ["metric", "risk_reduction_percent", "detail"],
            },
            overall_summary: { type: "STRING" },
            efficiency_score: { type: "INTEGER" },
          },
          required: ["safety_impact", "environmental_impact", "economic_impact", "health_impact", "overall_summary", "efficiency_score"],
        },
        temperature: 0.3,
      },
    });

    if (!response.text) {
      throw new Error("Empty AI response");
    }

    const impact = JSON.parse(response.text);
    return NextResponse.json({ success: true, impact });

  } catch (error: any) {
    console.error("Impact Simulator Error:", error);
    return NextResponse.json({ error: error.message || "Failed to simulate impact" }, { status: 500 });
  }
}
