import { nexusRepository } from "@/data/nexusDemoRepository";
import { CriticalPathEngine } from "@/domain/workflow/CriticalPathEngine";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  const size = Number(new URL(request.url).searchParams.get("size") ?? 180);
  const graph = nexusRepository.createWorkflowGraph(size);
  const analysis = new CriticalPathEngine().analyze(graph);

  return NextResponse.json({
    nodes: graph.getNodes(),
    edges: graph.getEdges(),
    analysis: {
      order: analysis.order,
      projectDuration: analysis.projectDuration,
      criticalNodeIds: analysis.criticalNodeIds,
      criticalEdgeIds: analysis.criticalEdgeIds,
      nodeSchedule: Object.fromEntries(analysis.nodeSchedule),
    },
  });
}
