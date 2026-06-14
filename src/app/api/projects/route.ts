import { projectRepository } from "@/data/ProjectRepository";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ projects: projectRepository.getProjects() });
}
