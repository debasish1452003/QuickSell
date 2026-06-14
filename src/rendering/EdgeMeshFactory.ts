import type { DependencyEdge } from "@/domain/workflow/DependencyEdge";
import type { CriticalPathAnalysis } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import * as THREE from "three";

export class EdgeMeshFactory {
  public create(edge: DependencyEdge, graph: WorkflowGraph, analysis: CriticalPathAnalysis): THREE.Line | null {
    const from = graph.getNode(edge.from);
    const to = graph.getNode(edge.to);
    if (!from || !to) return null;

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(from.position.x, from.position.y, from.position.z),
      new THREE.Vector3(to.position.x, to.position.y, to.position.z),
    ]);
    const critical = analysis.criticalEdgeIds.includes(edge.id);
    return new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: critical ? "#e5484d" : "#9aa8ba", opacity: critical ? 0.95 : 0.42, transparent: true })
    );
  }
}
