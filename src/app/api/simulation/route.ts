import { projectRepository } from "@/data/ProjectRepository";
import { SimulationEngine } from "@/domain/workflow/SimulationEngine";
import { getRequestSession } from "@/lib/RequestSession";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!getRequestSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const size = Number(body.size ?? 180);
  const iterations = Number(body.iterations ?? 2500);
  const graph = projectRepository.createWorkflowGraph(size);
  const report = new SimulationEngine(2026).run(graph, iterations);

  return NextResponse.json({ report });
}
