import type { TaskNode } from "@/domain/workflow/TaskNode";
import type { CriticalPathAnalysis, UserRole } from "@/domain/workflow/types";
import * as THREE from "three";

export class NodeMeshFactory {
  public create(node: TaskNode, analysis: CriticalPathAnalysis, selectedNodeId?: string, role: UserRole = "employer"): THREE.Mesh {
    const schedule = analysis.nodeSchedule.get(node.id);
    const color = this.getColor(node, Boolean(schedule?.isCritical), selectedNodeId === node.id, role);
    const selected = selectedNodeId === node.id;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(selected ? 9 : node.status === "blocked" ? 7.5 : 6.5, 24, 18),
      new THREE.MeshStandardMaterial({
        color,
        emissive: schedule?.isCritical || selected ? color : "#000000",
        emissiveIntensity: selected ? 0.28 : schedule?.isCritical ? 0.18 : 0,
        metalness: 0.18,
        roughness: 0.36,
      })
    );
    mesh.position.set(node.position.x, node.position.y, node.position.z);
    mesh.userData.nodeId = node.id;
    return mesh;
  }

  private getColor(node: TaskNode, critical: boolean, selected: boolean, role: UserRole): string {
    if (selected) return "#3867ff";
    if (critical) return "#e5484d";
    if (node.status === "blocked") return "#f97316";
    if (node.reviewStatus === "submitted") return "#8b5cf6";
    if (role === "client") return "#0ea5e9";
    if (role === "employee") return "#14b8a6";
    return "#0f9f8f";
  }
}
