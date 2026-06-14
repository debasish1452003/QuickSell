import { GraphAlgorithms } from "./GraphAlgorithms";
import type { CriticalPathAnalysis, NodeSchedule } from "./types";
import type { WorkflowGraph } from "./WorkflowGraph";

export class CriticalPathEngine {
  public analyze(graph: WorkflowGraph): CriticalPathAnalysis {
    const order = GraphAlgorithms.topologicalSort(graph);
    const incoming = graph.getIncomingMap();
    const adjacency = graph.getAdjacencyList();
    const earliestStart = new Map<string, number>();
    const earliestFinish = new Map<string, number>();
    const latestStart = new Map<string, number>();
    const latestFinish = new Map<string, number>();

    order.forEach((id) => {
      const node = graph.getNode(id);
      if (!node) return;
      const parents = incoming.get(id) ?? [];
      const start = parents.length
        ? Math.max(...parents.map((parentId) => earliestFinish.get(parentId) ?? 0))
        : 0;
      earliestStart.set(id, start);
      earliestFinish.set(id, start + node.durationHours);
    });

    const projectDuration = Math.max(0, ...order.map((id) => earliestFinish.get(id) ?? 0));

    [...order].reverse().forEach((id) => {
      const node = graph.getNode(id);
      if (!node) return;
      const children = adjacency.get(id) ?? [];
      const finish = children.length
        ? Math.min(...children.map((childId) => latestStart.get(childId) ?? projectDuration))
        : projectDuration;
      latestFinish.set(id, finish);
      latestStart.set(id, finish - node.durationHours);
    });

    const nodeSchedule = new Map<string, NodeSchedule>();
    const criticalNodeIds: string[] = [];

    order.forEach((id) => {
      const slack = (latestStart.get(id) ?? 0) - (earliestStart.get(id) ?? 0);
      const isCritical = Math.abs(slack) < 0.001;
      if (isCritical) criticalNodeIds.push(id);
      nodeSchedule.set(id, {
        earliestStart: earliestStart.get(id) ?? 0,
        earliestFinish: earliestFinish.get(id) ?? 0,
        latestStart: latestStart.get(id) ?? 0,
        latestFinish: latestFinish.get(id) ?? 0,
        slack,
        isCritical,
      });
    });

    const criticalEdgeIds = graph.getEdges()
      .filter((edge) => nodeSchedule.get(edge.from)?.isCritical && nodeSchedule.get(edge.to)?.isCritical)
      .filter((edge) => (earliestFinish.get(edge.from) ?? -1) === (earliestStart.get(edge.to) ?? -2))
      .map((edge) => edge.id);

    return { order, projectDuration, criticalNodeIds, criticalEdgeIds, nodeSchedule };
  }
}
