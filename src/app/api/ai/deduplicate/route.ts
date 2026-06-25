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

    const { description, lat, lng, imageUrl } = await req.json();

    if (!description || !lat || !lng) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Generate text embedding for the new issue
    const embedResponse = await ai.models.embedContent({
      model: MODELS.embedding,
      contents: description,
    });
    
    const embedding = embedResponse.embeddings?.[0]?.values;
    
    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    // 2. Query Supabase for nearby issues (within 50 meters)
    const { data: nearbyIssues, error: dbError } = await supabase
      .rpc('find_nearby_issues', {
        p_lat: lat,
        p_lng: lng,
        p_radius_meters: 50
      });

    if (dbError) {
      console.error("DB Error finding nearby issues:", dbError);
      throw new Error("Database query failed");
    }

    // If no nearby issues, it's definitely not a duplicate
    if (!nearbyIssues || nearbyIssues.length === 0) {
      return NextResponse.json({
        is_duplicate: false,
        matching_issue_id: null,
        confidence: 0,
        reason: "No nearby issues found within 50m radius.",
        embedding // Return embedding to save it when inserting the issue later
      });
    }

    // 3. Ask Gemini Flash to compare the new issue against nearby ones
    const comparisonPrompt = `
      You are an AI tasked with identifying duplicate municipal infrastructure reports.
      
      NEW REPORT:
      Description: "${description}"
      Image URL (if any): ${imageUrl || "None"}
      
      EXISTING NEARBY REPORTS (within 50 meters):
      ${nearbyIssues.map((issue: any, index: number) => `
      [${index + 1}] ID: ${issue.id}
      Title: "${issue.title}"
      Category: ${issue.category}
      Description: "${issue.description}"
      Status: ${issue.status}
      `).join("\n")}
      
      Determine if the NEW REPORT refers to the EXACT SAME physical problem as any of the EXISTING REPORTS.
      It must be the same specific instance (e.g., the same pothole, not just another pothole nearby).
      
      Return a JSON object with:
      - is_duplicate: boolean (true if > 0.8 confidence)
      - matching_issue_id: the ID of the matched issue, or null
      - confidence: float between 0.0 and 1.0
      - reason: a short 1-sentence explanation of your decision
    `;

    const aiResponse = await ai.models.generateContent({
      model: MODELS.flash,
      contents: comparisonPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            is_duplicate: { type: "BOOLEAN" },
            matching_issue_id: { type: "STRING", nullable: true },
            confidence: { type: "NUMBER" },
            reason: { type: "STRING" },
          },
          required: ["is_duplicate", "confidence", "reason"],
        },
        temperature: 0.1,
      },
    });

    const result = JSON.parse(aiResponse.text || "{}");

    // Ensure we also pass back the embedding so the client/server action can insert it
    return NextResponse.json({
      ...result,
      embedding
    });

  } catch (error: any) {
    console.error("Deduplication Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process" }, { status: 500 });
  }
}
