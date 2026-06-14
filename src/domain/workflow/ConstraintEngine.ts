import { GraphAlgorithms } from "./GraphAlgorithms";
import type { DependencyEdgeInput } from "./types";
import type { WorkflowGraph } from "./WorkflowGraph";

export class ConstraintEngine {
  public assertCanAddDependency(graph: WorkflowGraph, dependency: DependencyEdgeInput): void {
    const candidate = graph.clone();
    candidate.addDependency(dependency);
    if (GraphAlgorithms.hasCycle(candidate)) {
      throw new Error(`Dependency ${dependency.from}->${dependency.to} would create a cycle.`);
    }
  }
}
