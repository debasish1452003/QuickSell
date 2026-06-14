import { authService } from "@/data/AuthService";
import type { UserRole } from "@/domain/workflow/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const user = authService.login({ email: body.email, role: body.role as UserRole | undefined });
  return NextResponse.json({ user });
}
