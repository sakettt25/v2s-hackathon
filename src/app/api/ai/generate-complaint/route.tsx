import React from "react";
import { NextResponse } from "next/server";
import { ai, MODELS } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToStream } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { v4 as uuidv4 } from "uuid";

// Note: In production you'd load a real font buffer here
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 12, lineHeight: 1.5, color: "#333" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 },
  date: { marginBottom: 20, textAlign: "right" },
  subject: { fontSize: 14, fontWeight: "bold", marginBottom: 15 },
  body: { marginBottom: 20 },
  evidence: { backgroundColor: "#f5f5f5", padding: 15, borderRadius: 4, marginTop: 20 },
  evidenceTitle: { fontWeight: "bold", marginBottom: 5 },
});

const ComplaintPDF = ({ complaint, issue }: { complaint: any; issue: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>FORMAL MUNICIPAL COMPLAINT</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</Text>
      <Text style={styles.subject}>SUBJECT: {complaint.subject}</Text>
      <Text style={styles.body}>{complaint.body}</Text>
      <View style={styles.evidence}>
        <Text style={styles.evidenceTitle}>EVIDENCE & COMMUNITY CONSENSUS SUMMARY</Text>
        <Text>{complaint.evidence_summary}</Text>
        <Text>Urgency Level: {complaint.urgency_level.toUpperCase()}</Text>
        <Text>Recommended Department: {complaint.recommended_department}</Text>
        <Text>Community Verifications: {issue.upvote_count}</Text>
        <Text>Location: {issue.formatted_address || `${issue.lat}, ${issue.lng}`}</Text>
      </View>
    </Page>
  </Document>
);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { issueId } = await req.json();

    // 1. Fetch full issue data + verifications
    const { data: issue, error: issueError } = await admin
      .from("issues")
      .select("*, verifications(comment)")
      .eq("id", issueId)
      .single();

    if (issueError || !issue) {
      throw new Error("Issue not found");
    }

    const comments = issue.verifications
      .map((v: any) => v.comment)
      .filter(Boolean)
      .join(" | ");

    // 2. Ask Gemini Pro to generate the formal complaint text
    const prompt = `
      You are an expert municipal liaison drafting a formal complaint to the city government on behalf of the community.
      
      ISSUE DETAILS:
      Title: ${issue.title}
      Category: ${issue.category}
      Description: ${issue.description}
      Location: ${issue.formatted_address || `${issue.lat}, ${issue.lng}`}
      Upvotes (Community Verifications): ${issue.upvote_count}
      Community Comments: ${comments || "None"}
      
      Generate a formal, highly professional, polite but firm municipal complaint document.
      
      Return a JSON object with:
      - subject: Formal email/letter subject line
      - body: The main text of the letter (3-4 paragraphs)
      - evidence_summary: A concise bulleted summary of why this is urgent based on community data
      - urgency_level: "low", "medium", "high", or "critical"
      - recommended_department: The specific city department that should handle this (e.g., "Department of Transportation", "Public Works")
    `;

    const aiResponse = await ai.models.generateContent({
      model: MODELS.pro,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            subject: { type: "STRING" },
            body: { type: "STRING" },
            evidence_summary: { type: "STRING" },
            urgency_level: { type: "STRING" },
            recommended_department: { type: "STRING" },
          },
          required: ["subject", "body", "evidence_summary", "urgency_level", "recommended_department"],
        },
        temperature: 0.2,
      },
    });

    const complaintData = JSON.parse(aiResponse.text || "{}");

    // 3. Generate PDF
    const stream = await renderToStream(<ComplaintPDF complaint={complaintData} issue={issue} />);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    // 4. Upload PDF to Storage
    const fileName = `complaints/${issueId}_${uuidv4()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from("issue-media")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
      });

    if (uploadError) throw new Error("Failed to upload PDF");

    const { data: { publicUrl } } = admin.storage
      .from("issue-media")
      .getPublicUrl(fileName);

    // 5. Log Official Action
    await admin.from("official_actions").insert({
      issue_id: issueId,
      official_id: user.id,
      updates: `Generated formal complaint to ${complaintData.recommended_department}. PDF attached.`,
      action_type: "deferred"
    });

    return NextResponse.json({
      success: true,
      pdfUrl: publicUrl,
      complaint: complaintData
    });

  } catch (error: any) {
    console.error("Complaint Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate complaint" }, { status: 500 });
  }
}
