import { projectRepository } from "@/data/ProjectRepository";
import { CriticalPathEngine } from "@/domain/workflow/CriticalPathEngine";
import { getRequestSession } from "@/lib/RequestSession";
import { NextResponse } from "next/server";

export function GET(request: Request) {
  if (!getRequestSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const size = Number(new URL(request.url).searchParams.get("size") ?? 180);
  const graph = projectRepository.createWorkflowGraph(size);
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
