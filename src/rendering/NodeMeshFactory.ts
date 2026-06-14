import type { TaskNode } from "@/domain/workflow/TaskNode";
import type { CriticalPathAnalysis } from "@/domain/workflow/types";
import * as THREE from "three";

export class NodeMeshFactory {
  public create(node: TaskNode, analysis: CriticalPathAnalysis, selectedNodeId?: string): THREE.Mesh {
    const schedule = analysis.nodeSchedule.get(node.id);
    const color = schedule?.isCritical ? "#e5484d" : selectedNodeId === node.id ? "#3867ff" : "#0f9f8f";
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(selectedNodeId === node.id ? 8.5 : 6.5, 18, 14),
      new THREE.MeshStandardMaterial({ color, metalness: 0.08, roughness: 0.48 })
    );
    mesh.position.set(node.position.x, node.position.y, node.position.z);
    mesh.userData.nodeId = node.id;
    return mesh;
  }
}
