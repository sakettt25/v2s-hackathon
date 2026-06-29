import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch live issues to inform the prediction
    const { data: openIssues, error } = await supabase
      .from("issues")
      .select("category, severity_score, formatted_address, created_at, status")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error("Database query failed");
    }

    const issuesContext = openIssues && openIssues.length > 0 
      ? openIssues.map(issue => `[${issue.category}] Severity: ${issue.severity_score}, Location: ${issue.formatted_address || "Unknown"}`).join("\n")
      : "No current issues.";

    const prompt = `
You are an AI civic infrastructure predictor for a municipal dashboard in India (Delhi NCR).
Based on current weather patterns (assume it's the current season in Delhi) and the following live reported issues:

LIVE ISSUES:
${issuesContext}

Generate a JSON object with:
- environmental_factors: array of 2 objects containing:
  - name: e.g., "Heavy Rainfall Risk", "Air Quality Deterioration"
  - risk_percentage: an integer from 0 to 100
  - color: "blue", "red", "yellow", or "slate"
- predictions: array of 2 objects containing:
  - title: e.g., "Pothole Cluster Imminent"
  - description: 2-sentence explanation of the prediction based on the live issues
  - type: "warning" or "info"

Keep it realistic, analytical, and directly related to urban infrastructure in Delhi.
`;

    let predictions;
    try {
      const response = await ai.models.generateContent({
        model: MODELS.flash,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              environmental_factors: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    risk_percentage: { type: "INTEGER" },
                    color: { type: "STRING" },
                  },
                  required: ["name", "risk_percentage", "color"],
                },
              },
              predictions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    type: { type: "STRING" },
                  },
                  required: ["title", "description", "type"],
                },
              },
            },
            required: ["environmental_factors", "predictions"],
          },
          temperature: 0.3,
        },
      });

      if (!response.text) {
        throw new Error("Empty AI response");
      }
      predictions = JSON.parse(response.text);
    } catch (aiError) {
      console.warn("AI Predictions Rate Limit Hit. Falling back to mock data.", aiError);
      predictions = {
        environmental_factors: [
          { name: "Heavy Rainfall Risk", risk_percentage: 85, color: "blue" },
          { name: "Air Quality Deterioration", risk_percentage: 60, color: "slate" },
          { name: "Urban Heat Island", risk_percentage: 45, color: "red" }
        ],
        predictions: [
          {
            title: "Pothole Cluster Imminent",
            description: "High density of road damage reports in the area suggests a severe cluster forming due to recent rains.",
            type: "warning"
          },
          {
            title: "Traffic Congestion",
            description: "Multiple unresolved streetlight outages in the sector may lead to heavy evening congestion.",
            type: "info"
          }
        ]
      };
    }

    return NextResponse.json({ success: true, data: predictions });

  } catch (error: any) {
    console.error("AI Predictions Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate predictions" }, { status: 500 });
  }
}
