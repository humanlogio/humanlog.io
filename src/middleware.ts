import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// prettier-ignore
const protectedPatterns = [
    "/user/new/*",
    "/env/*",
    "/org/*",
];

function createRouteRegex(patterns: string[]): RegExp[] {
  return patterns.map((pattern) => {
    const escapedPattern = pattern.replace(/\*/g, ".*").replace(/\//g, "\\/");
    return new RegExp(`^${escapedPattern}$`);
  });
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("hlog_session");

  const protectedRoutes = createRouteRegex(protectedPatterns);
  const isProtectedRoute = protectedRoutes.some((regex) =>
    regex.test(req.nextUrl.pathname),
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/env/:path*", "/org/:path*"],
};
