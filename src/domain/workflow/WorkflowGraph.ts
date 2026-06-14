import { DependencyEdge } from "./DependencyEdge";
import { TaskNode } from "./TaskNode";
import type { DependencyEdgeInput, TaskNodeInput } from "./types";

export class WorkflowGraph {
  private readonly nodes: Map<string, TaskNode>;
  private readonly edges: Map<string, DependencyEdge>;

  public constructor(nodes: TaskNode[] = [], edges: DependencyEdge[] = []) {
    this.nodes = new Map(nodes.map((node) => [node.id, node]));
    this.edges = new Map(edges.map((edge) => [edge.id, edge]));
  }

  public clone(): WorkflowGraph {
    return new WorkflowGraph(this.getNodes(), this.getEdges());
  }

  public addNode(input: TaskNode | TaskNodeInput): TaskNode {
    const node = input instanceof TaskNode ? input : new TaskNode(input);
    this.nodes.set(node.id, node);
    return node;
  }

  public updateNode(id: string, patch: Partial<TaskNodeInput>): TaskNode {
    const node = this.getNode(id);
    if (!node) {
      throw new Error(`Cannot update missing task ${id}.`);
    }
    const next = node.withPatch(patch);
    this.nodes.set(id, next);
    return next;
  }

  public addDependency(input: DependencyEdge | DependencyEdgeInput): DependencyEdge {
    const edge = input instanceof DependencyEdge ? input : new DependencyEdge(input);
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error("Both dependency endpoints must exist.");
    }
    this.edges.set(edge.id, edge);
    return edge;
  }

  public removeDependency(edgeId: string): void {
    this.edges.delete(edgeId);
  }

  public removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.edges.forEach((edge, edgeId) => {
      if (edge.from === nodeId || edge.to === nodeId) {
        this.edges.delete(edgeId);
      }
    });
  }

  public getNode(id: string): TaskNode | undefined {
    return this.nodes.get(id);
  }

  public getNodes(): TaskNode[] {
    return Array.from(this.nodes.values());
  }

  public getEdges(): DependencyEdge[] {
    return Array.from(this.edges.values());
  }

  public getAdjacencyList(): Map<string, string[]> {
    const adjacency = new Map<string, string[]>();
    this.nodes.forEach((_, id) => adjacency.set(id, []));
    this.edges.forEach((edge) => adjacency.get(edge.from)?.push(edge.to));
    adjacency.forEach((targets) => targets.sort());
    return adjacency;
  }

  public getIncomingMap(): Map<string, string[]> {
    const incoming = new Map<string, string[]>();
    this.nodes.forEach((_, id) => incoming.set(id, []));
    this.edges.forEach((edge) => incoming.get(edge.to)?.push(edge.from));
    incoming.forEach((sources) => sources.sort());
    return incoming;
  }
}
