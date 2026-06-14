import type { WorkflowGraph } from "./WorkflowGraph";

export class GraphAlgorithms {
  public static topologicalSort(graph: WorkflowGraph): string[] {
    const ids = graph.getNodes().map((node) => node.id).sort();
    const adjacency = graph.getAdjacencyList();
    const inDegree = new Map(ids.map((id) => [id, 0]));

    graph.getEdges().forEach((edge) => {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    });

    const queue = ids.filter((id) => inDegree.get(id) === 0);
    const ordered: string[] = [];

    while (queue.length > 0) {
      queue.sort();
      const id = queue.shift();
      if (!id) continue;
      ordered.push(id);
      adjacency.get(id)?.forEach((childId) => {
        inDegree.set(childId, (inDegree.get(childId) ?? 0) - 1);
        if (inDegree.get(childId) === 0) {
          queue.push(childId);
        }
      });
    }

    if (ordered.length !== ids.length) {
      throw new Error("Graph contains a cycle.");
    }

    return ordered;
  }

  public static hasCycle(graph: WorkflowGraph): boolean {
    try {
      GraphAlgorithms.topologicalSort(graph);
      return false;
    } catch {
      return true;
    }
  }
}
