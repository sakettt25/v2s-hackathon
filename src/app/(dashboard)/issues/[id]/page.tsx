import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/jwt";
import { notFound } from "next/navigation";
import IssueDetailClient from "./issue-detail-client";

export const dynamic = "force-dynamic";

export default async function IssueDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const supabase = await createClient();

  // Fetch Issue Data
  const { data: issue, error } = await supabase
    .from("issues")
    .select("*, profiles(full_name, role)")
    .eq("id", params.id)
    .single();

  if (error || !issue) {
    notFound();
  }

  // Fetch Verification Count
  const { count: verificationCount } = await supabase
    .from("verifications")
    .select("*", { count: "exact", head: true })
    .eq("issue_id", params.id)
    .eq("status", "valid");

  // Check if current user has already verified
  let hasVerified = false;
  if (session?.user) {
    const { data: existing } = await supabase
      .from("verifications")
      .select("id")
      .eq("issue_id", params.id)
      .eq("user_id", session.user.id)
      .single();
    if (existing) hasVerified = true;
  }

  return (
    <IssueDetailClient 
      issue={issue} 
      verificationCount={verificationCount || 0} 
      hasVerified={hasVerified} 
    />
  );
}
