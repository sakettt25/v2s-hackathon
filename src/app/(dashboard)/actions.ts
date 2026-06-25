"use server";

import { getSession } from "@/lib/auth/jwt";
import { createClient } from "@/lib/supabase/server";

export async function getUserProfile() {
  const session = await getSession();
  
  if (!session || !session.user) {
    return { points: 0, role: "citizen", id: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      issues (id),
      verifications (id)
    `)
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    return { points: 0, role: session.user.role, id: session.user.id };
  }

  const issuesCount = data.issues?.length || 0;
  const verificationsCount = data.verifications?.length || 0;
  const points = (issuesCount * 10) + (verificationsCount * 5);

  return {
    id: data.id,
    role: data.role,
    points,
  };
}

export async function getNotifications() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issues")
    .select("id, title, category, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error || !data) {
    return [];
  }
  return data;
}
