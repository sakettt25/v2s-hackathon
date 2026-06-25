"use server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/jwt";
import { revalidatePath } from "next/cache";

export async function submitVerification(issueId: string, status: "approve" | "dispute") {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Check if user already verified this issue
  const { data: existing } = await supabase
    .from("verifications")
    .select("id")
    .eq("issue_id", issueId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "Already verified" };
  }

  // Insert verification record
  const { error: insertError } = await supabase
    .from("verifications")
    .insert({
      issue_id: issueId,
      user_id: session.user.id,
      status: status,
    });

  if (insertError) {
    console.error("Verification insert error:", insertError);
    return { success: false, error: "Failed to save verification." };
  }

  // If enough approvals, auto-promote the issue to "verifying" status
  const { count } = await supabase
    .from("verifications")
    .select("*", { count: "exact", head: true })
    .eq("issue_id", issueId)
    .eq("status", "approve");

  if (count && count >= 3) {
    await supabase
      .from("issues")
      .update({ status: "verifying" })
      .eq("id", issueId)
      .eq("status", "open"); // Only promote if still open
  }

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/analytics");

  return { success: true };
}
