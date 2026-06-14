import { authService } from "@/data/AuthService";
import type { UserRole } from "@/domain/workflow/types";
import { getRequestSession } from "@/lib/RequestSession";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  if (!getRequestSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const role = new URL(request.url).searchParams.get("role") as UserRole | null;
  return NextResponse.json({ user: authService.getSession(role ?? "employer") });
}
