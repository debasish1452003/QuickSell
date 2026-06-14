import * as THREE from "three";

export class GraphRaycaster {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();

  public pick(event: PointerEvent, element: HTMLElement, camera: THREE.Camera, meshes: THREE.Object3D[]): string | null {
    const rect = element.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, camera);
    const hit = this.raycaster.intersectObjects(meshes)[0];
    return hit?.object.userData.nodeId ?? null;
  }
}
