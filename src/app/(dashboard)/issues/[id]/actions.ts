"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";

export async function verifyIssueAction(issueId: string) {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();

  // 1. Check if already verified
  const { data: existingVerification } = await supabase
    .from("verifications")
    .select("id")
    .eq("issue_id", issueId)
    .eq("user_id", session.user.id)
    .single();

  if (existingVerification) {
    return { success: false, error: "You have already verified this issue." };
  }

  // 2. Insert Verification
  const { error: insertError } = await supabase
    .from("verifications")
    .insert({
      issue_id: issueId,
      user_id: session.user.id,
      status: "valid"
    });

  if (insertError) {
    console.error("Verification error:", insertError);
    return { success: false, error: "Failed to verify issue." };
  }

  // 3. Auto-Escalation Logic
  // Count total verifications
  const { count } = await supabase
    .from("verifications")
    .select("*", { count: "exact", head: true })
    .eq("issue_id", issueId)
    .eq("status", "valid");

  if (count && count >= 3) {
    // Escalate issue if it's currently open
    const { data: issue } = await supabase.from("issues").select("status").eq("id", issueId).single();
    if (issue?.status === "open") {
      await supabase
        .from("issues")
        .update({ status: "verifying" }) // Escalate to verifying/investigating state
        .eq("id", issueId);
    }
  }

  revalidatePath(`/issues/${issueId}`);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/leaderboard");

  return { success: true };
}

export async function upvoteIssueAction(issueId: string) {
  const supabase = await createClient();
  
  // For hackathon simplicity, we just increment the counter directly. 
  // In prod, you'd track upvotes in a relation table to prevent multi-voting.
  
  const { data: issue } = await supabase.from("issues").select("upvote_count").eq("id", issueId).single();
  const currentUpvotes = issue?.upvote_count || 0;

  await supabase
    .from("issues")
    .update({ upvote_count: currentUpvotes + 1 })
    .eq("id", issueId);

  revalidatePath(`/issues/${issueId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function generateResolutionPlanAction(issueId: string, _description?: string, _category?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://v2s-hackathon-169783553719.asia-south2.run.app";
    const res = await fetch(`${baseUrl}/api/ai/resolution-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error || "Failed to generate plan." };
    }

    const data = await res.json();
    return { success: true, plan: data.plan };
  } catch (error: any) {
    console.error("Resolution Plan Error:", error);
    return { success: false, error: "Failed to generate AI action plan." };
  }
}

export async function disputeResolutionAction(issueId: string) {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Revert status to open
  const { error: updateError } = await supabase
    .from("issues")
    .update({ status: "open" })
    .eq("id", issueId)
    .eq("status", "resolved");

  if (updateError) {
    return { success: false, error: "Failed to dispute resolution." };
  }

  // Log official action for transparency
  await supabase
    .from("official_actions")
    .insert({
      issue_id: issueId,
      official_id: session.user.id,
      action_type: "disputed",
      updates: "[CITIZEN DISPUTE] Resolution rejected. Returned to OPEN status."
    });

  revalidatePath(`/issues/${issueId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
