"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { REPUTATION_ACTIONS, CONSENSUS_THRESHOLDS } from "@/lib/constants";
import type { VerificationStatus } from "@/lib/types";

// Note: In production, you'd want robust database constraints or a transaction
// using a plpgsql function, but doing it in a server action works for the MVP.
export async function submitVerification(issueId: string, status: VerificationStatus, comment: string) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Insert Verification Record
    const { error: insertError } = await supabase
      .from("verifications")
      .insert({
        issue_id: issueId,
        user_id: user.id,
        status,
        comment: comment || null,
      });

    if (insertError) {
      if (insertError.code === '23505') throw new Error("You have already verified this issue.");
      throw insertError;
    }

    // 2. Grant Reputation Points based on action
    // In a real system, you might only grant points *after* consensus is reached,
    // but for immediate gamification we grant small amounts now.
    const points = status === "approve" ? REPUTATION_ACTIONS.VERIFICATION_ALIGNED : REPUTATION_ACTIONS.VERIFICATION_MINORITY;
    
    await admin.rpc('increment_reputation', { 
      user_id: user.id, 
      points_to_add: points 
    });

    // 3. Update Issue Upvote Count
    if (status === "approve") {
      await admin.rpc('increment_issue_upvotes', {
        p_issue_id: issueId
      });
    }

    // 4. CITIZEN CONSENSUS THRESHOLD AUTOMATION
    // Fetch updated issue to check thresholds
    const { data: issue } = await admin
      .from("issues")
      .select("status, upvote_count")
      .eq("id", issueId)
      .single();

    if (issue) {
      if (issue.status === "verifying" && issue.upvote_count >= CONSENSUS_THRESHOLDS.AUTO_OPEN) {
        // Threshold 1: Transition from verifying to open
        await admin
          .from("issues")
          .update({ status: "open" })
          .eq("id", issueId);
          
        await admin.from("official_actions").insert({
          issue_id: issueId,
          official_id: user.id, // technically system, but using user.id for FK constraint
          updates: "Community consensus reached. Issue automatically transitioned to OPEN.",
          action_type: "deferred"
        });
      }
      
      if (issue.upvote_count === CONSENSUS_THRESHOLDS.AUTO_COMPLAINT) {
        // Threshold 2: Auto-fire Complaint Generation (Queue it)
        // In this MVP, we log the action. An Edge Function or webhook would normally pick this up.
        await admin.from("official_actions").insert({
          issue_id: issueId,
          official_id: user.id,
          updates: "Critical consensus reached. Triggered autonomous complaint generation to municipal office.",
          action_type: "auto-complaint"
        });
        
        // You would call your API route here asynchronously:
        // fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://v2s-hackathon-169783553719.asia-south2.run.app"}/api/ai/generate-complaint`, { ... })
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Verification Error:", error);
    return { error: error.message || "Failed to submit verification" };
  }
}
