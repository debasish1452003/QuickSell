import { nexusRepository } from "@/data/nexusDemoRepository";
import type { UserRole } from "@/domain/workflow/types";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  const role = new URL(request.url).searchParams.get("role") as UserRole | null;
  return NextResponse.json({ user: nexusRepository.getSession(role ?? "admin") });
}
