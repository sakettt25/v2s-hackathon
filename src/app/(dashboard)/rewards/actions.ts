"use server";

import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/jwt";

// To avoid DB migrations during the hackathon, we track redeemed points in a secure HttpOnly cookie.
// The data fetcher in src/lib/data.ts will read this to deduct from the dynamically computed score.
export async function redeemRewardAction(cost: number, rewardId: string) {
  const session = await getSession();
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  const cookieStore = await cookies();
  const cookieName = `redeemed_points_${session.user.id}`;
  const currentRedeemed = parseInt(cookieStore.get(cookieName)?.value || "0");
  
  // Update the redeemed points total
  const newTotal = currentRedeemed + cost;
  
  cookieStore.set(cookieName, newTotal.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });

  return { success: true };
}
