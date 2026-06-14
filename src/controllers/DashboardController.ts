import { dashboardService } from "@/data/DashboardService";
import { projectRepository } from "@/data/ProjectRepository";
import type { UserRole } from "@/domain/workflow/types";
import { getRequestSession } from "@/lib/RequestSession";
import { NextResponse } from "next/server";

export class DashboardController {
  public getDashboard(request: Request): NextResponse {
    const params = new URL(request.url).searchParams;
    const session = getRequestSession(request);
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const size = Number(params.get("size") ?? 180);
    const role = (params.get("role") as UserRole | null) ?? session.role;
    const user =
      role === session.role
        ? projectRepository.getUserById(session.userId) ?? projectRepository.getUserByRole(role)
        : projectRepository.getUserByRole(role);
    return NextResponse.json(dashboardService.getDashboardForUser(user, role, size));
  }
}

export const dashboardController = new DashboardController();
