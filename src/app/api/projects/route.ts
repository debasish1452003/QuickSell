import { nexusRepository } from "@/data/nexusDemoRepository";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ projects: nexusRepository.getProjects() });
}
