import { DependencyEdge } from "@/domain/workflow/DependencyEdge";
import { TaskNode } from "@/domain/workflow/TaskNode";
import type { CriticalPathAnalysis, NodeSchedule, TaskNodeInput } from "@/domain/workflow/types";
import { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";

export interface SerializedGraphPayload {
  nodes: TaskNodeInput[];
  edges: Array<{ from: string; to: string; lagHours?: number; kind?: "finish_to_start" | "review_gate" | "release_gate" }>;
  analysis: Omit<CriticalPathAnalysis, "nodeSchedule"> & { nodeSchedule: Record<string, NodeSchedule> };
}

export function hydrateGraph(payload: SerializedGraphPayload): { graph: WorkflowGraph; analysis: CriticalPathAnalysis } {
  const graph = new WorkflowGraph(
    payload.nodes.map((node) => new TaskNode(node)),
    payload.edges.map((edge) => new DependencyEdge(edge))
  );

  return {
    graph,
    analysis: {
      ...payload.analysis,
      nodeSchedule: new Map(Object.entries(payload.analysis.nodeSchedule)),
    },
  };
}
