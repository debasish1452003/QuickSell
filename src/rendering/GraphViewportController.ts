import type { TaskNode } from "@/domain/workflow/TaskNode";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

export class GraphViewportController {
  private autoOrbit = true;

  public constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls
  ) {}

  public setAutoOrbit(enabled: boolean): void {
    this.autoOrbit = enabled;
  }

  public getAutoOrbit(): boolean {
    return this.autoOrbit;
  }

  public focusNode(node: TaskNode | undefined): void {
    if (!node) return;
    const target = new THREE.Vector3(node.position.x, node.position.y, node.position.z);
    this.autoOrbit = false;
    this.controls.target.copy(target);
    this.camera.position.set(target.x + 180, target.y - 270, target.z + 220);
    this.camera.lookAt(target);
    this.controls.update();
  }

  public frameGraph(nodes: TaskNode[]): void {
    if (nodes.length === 0) return;
    const box = new THREE.Box3();
    nodes.forEach((node) => box.expandByPoint(new THREE.Vector3(node.position.x, node.position.y, node.position.z)));
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance = Math.max(size.x, size.y, 220) * 1.08;
    this.autoOrbit = false;
    this.controls.target.copy(center);
    this.camera.position.set(center.x + distance, center.y - distance * 1.18, center.z + distance * 0.72);
    this.camera.lookAt(center);
    this.controls.update();
  }

  public tick(scene: THREE.Scene): void {
    if (this.autoOrbit) scene.rotation.z = Math.sin(Date.now() / 5200) * 0.01;
    this.controls.update();
  }
}
