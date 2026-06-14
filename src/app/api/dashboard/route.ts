import { dashboardService } from "@/data/DashboardService";
import type { UserRole } from "@/domain/workflow/types";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const role = (params.get("role") ?? "employer") as UserRole;
  const size = Number(params.get("size") ?? 180);
  return NextResponse.json(dashboardService.getDashboard(role, size));
}
