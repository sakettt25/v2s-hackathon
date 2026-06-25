import { createClient } from "./supabase/server";
import { cookies } from "next/headers";

export async function getIssues() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("issues")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching issues:", error);
    return [];
  }
  return data;
}

export async function getLeaderboard() {
  const supabase = await createClient();
  
  // Fetch profiles with their associated issue and verification counts
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      role,
      issues (id),
      verifications (id)
    `);

  if (error || !data) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  // Calculate points dynamically
  const leaderboard = data.map((profile: any) => {
    const issuesCount = profile.issues?.length || 0;
    const verificationsCount = profile.verifications?.length || 0;
    const points = (issuesCount * 10) + (verificationsCount * 5);

    return {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      points,
      verified: verificationsCount,
    };
  });

  // Sort by points descending
  return leaderboard.sort((a, b) => b.points - a.points);
}

export async function getAnalytics() {
  const supabase = await createClient();
  
  // 1. Total Issues
  const { count: totalIssues } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true });

  const { data: resolvedData } = await supabase
    .from("issues")
    .select("created_at, updated_at")
    .eq("status", "resolved");

  const resolvedIssues = resolvedData?.length || 0;

  // Compute Avg Resolution Time
  let avgResolutionDays = 0;
  if (resolvedData && resolvedData.length > 0) {
    const totalMs = resolvedData.reduce((acc, issue) => {
      const created = new Date(issue.created_at).getTime();
      const updated = new Date(issue.updated_at).getTime();
      return acc + (updated - created);
    }, 0);
    const avgMs = totalMs / resolvedData.length;
    avgResolutionDays = avgMs / (1000 * 60 * 60 * 24);
  }

  // 3. Active Citizens
  const { count: activeCitizens } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  
  // Compute Resolution Rate
  const resolutionRate = totalIssues ? ((resolvedIssues || 0) / totalIssues) * 100 : 0;

  // 4. Category Breakdown
  const { data: categoryDataRaw } = await supabase
    .from("issues")
    .select("category");

  const categoryMap: Record<string, number> = {};
  categoryDataRaw?.forEach(issue => {
    categoryMap[issue.category] = (categoryMap[issue.category] || 0) + 1;
  });

  const CATEGORY_DATA = Object.keys(categoryMap).map(key => {
    // Map categories to distinct tailwind-compatible hex colors
    let color = "#94a3b8"; // default slate
    if (key === "pothole") color = "#e11d48"; // rose-600
    if (key === "broken_streetlight") color = "#f59e0b"; // amber-500
    if (key === "garbage") color = "#8b5cf6"; // violet-500
    if (key === "water_leak") color = "#3b82f6"; // blue-500

    return { name: key, value: categoryMap[key], color };
  }).sort((a, b) => b.value - a.value);

  // 5. Time Series (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: recentIssues } = await supabase
    .from("issues")
    .select("created_at, status")
    .gte("created_at", sevenDaysAgo.toISOString());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSeriesMap: Record<string, { reported: number, resolved: number }> = {};
  
  // Initialize the last 7 days array in order
  const orderedDays: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = days[d.getDay()];
    orderedDays.push(dayName);
    timeSeriesMap[dayName] = { reported: 0, resolved: 0 };
  }

  recentIssues?.forEach(issue => {
    const d = new Date(issue.created_at);
    const dayName = days[d.getDay()];
    if (timeSeriesMap[dayName]) {
      timeSeriesMap[dayName].reported += 1;
      if (issue.status === "resolved") {
        timeSeriesMap[dayName].resolved += 1;
      }
    }
  });

  const TIME_SERIES_DATA = orderedDays.map(date => ({
    date,
    reported: timeSeriesMap[date].reported,
    resolved: timeSeriesMap[date].resolved
  }));

  // AI Impact Estimations (Dynamic based on real counts)
  const totalPotholes = categoryMap["pothole"] || 0;
  const totalLights = categoryMap["broken_streetlight"] || 0;
  
  const aiEstimations = {
    co2: (totalPotholes * 12) + 45, // Dynamic calculation
    accidents: Math.floor((totalLights * 2.5) + (totalPotholes * 0.5)) + 2, // Dynamic calculation
  };

  return {
    totalIssues: totalIssues || 0,
    resolutionRate: resolutionRate.toFixed(1),
    avgResolutionDays: avgResolutionDays > 0 ? avgResolutionDays.toFixed(1) : "0",
    activeCitizens: activeCitizens || 0,
    CATEGORY_DATA,
    TIME_SERIES_DATA,
    aiEstimations
  };
}

export async function getUserProfile() {
  const { getSession } = await import("@/lib/auth/jwt");
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
  
  // Fetch redeemed points from cookie
  const cookieStore = await cookies();
  const redeemedPoints = parseInt(cookieStore.get(`redeemed_points_${session.user.id}`)?.value || "0");
  
  const points = Math.max(0, (issuesCount * 10) + (verificationsCount * 5) - redeemedPoints);

  return {
    id: data.id,
    role: data.role,
    points,
  };
}
