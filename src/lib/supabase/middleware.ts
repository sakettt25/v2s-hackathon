import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wmlkuecaywpnyaycperb.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGt1ZWNheXdwbnlheWNwZXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTgwNzgsImV4cCI6MjA5Nzg3NDA3OH0.cB6aozQwOH6NNLYjVBjJFyzvRk8_eSKLlevVyas6ZPE",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/report") ||
    request.nextUrl.pathname.startsWith("/analytics") ||
    request.nextUrl.pathname.startsWith("/leaderboard");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Append the original intended URL so we can return them after login
    url.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = 
    request.nextUrl.pathname === "/login" || 
    request.nextUrl.pathname === "/signup";

  if (isAuthRoute && user) {
    const returnTo = request.nextUrl.searchParams.get("returnTo");
    const url = request.nextUrl.clone();
    url.pathname = returnTo || "/dashboard";
    url.search = ""; // clear params
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
