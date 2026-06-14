import { authService } from "@/data/AuthService";
import type { UserRole } from "@/domain/workflow/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const role = (body.role ?? "employee") as UserRole;
  const user = authService.signup({
    name: String(body.name ?? "Demo User"),
    email: String(body.email ?? `demo-${Date.now()}@nexusdag.dev`),
    role,
    title: body.title ? String(body.title) : undefined,
  });
  return NextResponse.json({ user }, { status: 201 });
}
