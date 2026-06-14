import { projectRepository } from "@/data/ProjectRepository";
import { getRequestSession } from "@/lib/RequestSession";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  if (!getRequestSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  return NextResponse.json({ projects: projectRepository.getProjects() });
}

export async function POST(request: Request) {
  const session = getRequestSession(request);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (session.role !== "employer") return NextResponse.json({ error: "Only employers can create projects." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const client = String(body.client ?? "").trim();
  const releaseDate = String(body.releaseDate ?? "").trim();

  if (!name || !client || !releaseDate) {
    return NextResponse.json({ error: "name, client, and releaseDate are required." }, { status: 400 });
  }

  const project = projectRepository.createProject({
    name,
    client,
    releaseDate,
    clientUserId: typeof body.clientUserId === "string" ? body.clientUserId : undefined,
    employeeIds: Array.isArray(body.employeeIds) ? body.employeeIds.map(String) : undefined,
    budgetUsed: Number(body.budgetUsed ?? 0),
  });

  return NextResponse.json({ project }, { status: 201 });
}
