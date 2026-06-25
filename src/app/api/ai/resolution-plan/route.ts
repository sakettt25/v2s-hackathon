import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { issueId } = await req.json();

    if (!issueId) {
      return NextResponse.json({ error: "Missing issueId" }, { status: 400 });
    }

    // Fetch full issue context
    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .select("*, profiles(full_name), verifications(comment, status)")
      .eq("id", issueId)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const verificationCount = issue.verifications?.filter((v: any) => v.status === "valid").length || 0;
    const comments = issue.verifications?.map((v: any) => v.comment).filter(Boolean).join("; ") || "None";

    const prompt = `
You are an AI urban infrastructure resolution advisor for a municipal civic platform in India.

ISSUE DETAILS:
- Title: "${issue.title}"
- Category: ${issue.category}
- Description: "${issue.description}"
- Location: ${issue.formatted_address || `${issue.lat}, ${issue.lng}`}
- Severity Score: ${issue.severity_score}/10
- Community Verifications: ${verificationCount}
- Community Comments: ${comments}
- Days Open: ${Math.ceil((Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24))}

Generate a detailed, actionable resolution plan that a municipal authority can immediately execute.

Return a JSON object with:
- department: The specific Indian municipal department responsible (e.g., "PWD - Roads Division", "BSES Electricity", "DJB Water Supply", "MCD Sanitation")
- estimated_cost_inr: Estimated cost range as a string (e.g., "₹15,000 - ₹25,000")
- estimated_days: Integer, estimated working days to resolve
- priority_level: "critical", "high", "medium", or "low"
- steps: Array of objects, each with:
  - step_number: Integer
  - action: Short action title (e.g., "Site Inspection")
  - description: 1-2 sentence detail of what needs to happen
  - responsible_team: Who handles this step
  - duration_hours: Estimated hours for this step
- resources_required: Array of strings listing materials/equipment needed (e.g., "Bitumen (2 tonnes)", "JCB excavator", "Traffic barricades")
- safety_considerations: 1-2 sentences about safety during repair
- community_impact_note: 1 sentence about how fixing this benefits the local community
`;

    const response = await ai.models.generateContent({
      model: MODELS.flash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            department: { type: "STRING" },
            estimated_cost_inr: { type: "STRING" },
            estimated_days: { type: "INTEGER" },
            priority_level: { type: "STRING" },
            steps: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  step_number: { type: "INTEGER" },
                  action: { type: "STRING" },
                  description: { type: "STRING" },
                  responsible_team: { type: "STRING" },
                  duration_hours: { type: "INTEGER" },
                },
                required: ["step_number", "action", "description", "responsible_team", "duration_hours"],
              },
            },
            resources_required: { type: "ARRAY", items: { type: "STRING" } },
            safety_considerations: { type: "STRING" },
            community_impact_note: { type: "STRING" },
          },
          required: ["department", "estimated_cost_inr", "estimated_days", "priority_level", "steps", "resources_required", "safety_considerations", "community_impact_note"],
        },
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error("Empty AI response");
    }

    const plan = JSON.parse(response.text);
    return NextResponse.json({ success: true, plan });

  } catch (error: any) {
    console.error("Resolution Plan Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate plan" }, { status: 500 });
  }
}
