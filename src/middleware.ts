import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "./lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const user = session ? session.user : null;

  // Protected routes — redirect to login if not authenticated
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/report") ||
    request.nextUrl.pathname.startsWith("/analytics") ||
    request.nextUrl.pathname.startsWith("/leaderboard");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
