import { SESSION_COOKIE } from "@/lib/SessionCookie";
import { appUrl } from "@/lib/AppUrl";
import { NextRequest, NextResponse } from "next/server";

const protectedApiPrefixes = [
  "/api/dashboard",
  "/api/projects",
  "/api/session",
  "/api/simulation",
  "/api/tasks",
  "/api/workflow",
];

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    if (protectedApiPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const login = appUrl("/login", request);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/api/dashboard",
    "/api/dashboard/:path*",
    "/api/projects",
    "/api/projects/:path*",
    "/api/session",
    "/api/session/:path*",
    "/api/simulation",
    "/api/simulation/:path*",
    "/api/tasks",
    "/api/tasks/:path*",
    "/api/workflow",
    "/api/workflow/:path*",
  ],
};
