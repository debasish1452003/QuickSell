import type { TaskNode } from "@/domain/workflow/TaskNode";
import type { CriticalPathAnalysis, DelayAnalysis, UserRole } from "@/domain/workflow/types";
import * as THREE from "three";

export interface NodeRenderOptions {
  gateOverlay: boolean;
  riskScan: boolean;
  slaDrift: boolean;
  delays: DelayAnalysis[];
}

export class NodeMeshFactory {
  public create(
    node: TaskNode,
    analysis: CriticalPathAnalysis,
    selectedNodeId?: string,
    role: UserRole = "employer",
    options: NodeRenderOptions = { gateOverlay: true, riskScan: true, slaDrift: true, delays: [] }
  ): THREE.Mesh {
    const schedule = analysis.nodeSchedule.get(node.id);
    const delay = options.delays.find((item) => item.taskId === node.id);
    const color = this.getColor(node, Boolean(schedule?.isCritical), selectedNodeId === node.id, role, delay, options);
    const selected = selectedNodeId === node.id;
    const attention = (options.riskScan && delay?.riskLevel === "high") || (options.slaDrift && delay?.isOverdue);
    const radius = selected ? 9.4 : attention ? 8.2 : node.status === "blocked" ? 7.6 : 6.6;
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 0.92, selected ? 8 : 6, 28, 1),
      new THREE.MeshStandardMaterial({
        color,
        emissive: schedule?.isCritical || selected || attention ? color : "#000000",
        emissiveIntensity: selected ? 0.38 : attention ? 0.28 : schedule?.isCritical ? 0.2 : 0,
        metalness: 0.32,
        roughness: 0.28,
      })
    );
    mesh.position.set(node.position.x, node.position.y, node.position.z);
    mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.nodeId = node.id;
    return mesh;
  }

  private getColor(
    node: TaskNode,
    critical: boolean,
    selected: boolean,
    role: UserRole,
    delay: DelayAnalysis | undefined,
    options: NodeRenderOptions
  ): string {
    if (selected) return "#2563eb";
    if (options.riskScan && delay?.riskLevel === "high") return "#dc2626";
    if (options.slaDrift && delay?.isOverdue) return "#ea580c";
    if (options.gateOverlay && node.reviewStatus === "submitted") return "#7c3aed";
    if (critical) return "#e5484d";
    if (node.status === "blocked") return "#f97316";
    if (node.reviewStatus === "submitted") return "#8b5cf6";
    if (role === "client") return "#0ea5e9";
    if (role === "employee") return "#14b8a6";
    return "#0f9f8f";
  }
}
