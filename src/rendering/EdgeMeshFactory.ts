import type { DependencyEdge } from "@/domain/workflow/DependencyEdge";
import type { CriticalPathAnalysis } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import * as THREE from "three";

export class EdgeMeshFactory {
  public create(edge: DependencyEdge, graph: WorkflowGraph, analysis: CriticalPathAnalysis): THREE.Line | null {
    const from = graph.getNode(edge.from);
    const to = graph.getNode(edge.to);
    if (!from || !to) return null;

    const critical = analysis.criticalEdgeIds.includes(edge.id);
    const start = new THREE.Vector3(from.position.x, from.position.y, from.position.z);
    const end = new THREE.Vector3(to.position.x, to.position.y, to.position.z);
    const mid = start.clone().lerp(end, 0.5);
    mid.z += edge.kind === "review_gate" ? 28 : edge.kind === "release_gate" ? 42 : 16;
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(20));
    const color = critical ? "#e5484d" : edge.kind === "review_gate" ? "#7c3aed" : edge.kind === "release_gate" ? "#0f766e" : "#64748b";
    return new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color, opacity: critical ? 0.95 : 0.5, transparent: true })
    );
  }
}
