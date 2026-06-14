import { nexusRepository } from "@/data/nexusDemoRepository";
import { SimulationEngine } from "@/domain/workflow/SimulationEngine";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const size = Number(body.size ?? 180);
  const iterations = Number(body.iterations ?? 2500);
  const graph = nexusRepository.createWorkflowGraph(size);
  const report = new SimulationEngine(2026).run(graph, iterations);

  return NextResponse.json({ report });
}
