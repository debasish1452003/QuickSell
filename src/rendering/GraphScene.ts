import type { CriticalPathAnalysis, UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import { EdgeMeshFactory } from "@/rendering/EdgeMeshFactory";
import { GraphRaycaster } from "@/rendering/GraphRaycaster";
import { NodeMeshFactory } from "@/rendering/NodeMeshFactory";
import { SpatialIndex } from "@/rendering/SpatialIndex";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

export interface RenderStats {
  visibleNodes: number;
  culledNodes: number;
  renderedEdges: number;
}

export class GraphScene {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly nodeFactory = new NodeMeshFactory();
  private readonly edgeFactory = new EdgeMeshFactory();
  private readonly raycaster = new GraphRaycaster();
  private readonly nodeMeshes = new Map<string, THREE.Mesh>();
  private readonly edgeGroup = new THREE.Group();
  private frameId = 0;

  public constructor(private readonly host: HTMLDivElement) {
    this.scene.background = new THREE.Color("#f5f7fb");
    this.camera = new THREE.PerspectiveCamera(48, host.clientWidth / host.clientHeight, 0.1, 6000);
    this.camera.position.set(260, -380, 430);
    this.camera.lookAt(220, 0, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    this.host.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.screenSpacePanning = true;
    this.controls.target.set(220, 0, 0);
    this.scene.add(new THREE.AmbientLight("#ffffff", 0.88));
    const light = new THREE.DirectionalLight("#ffffff", 1.1);
    light.position.set(180, -250, 360);
    this.scene.add(light);
    this.scene.add(this.edgeGroup);
    this.animate();
  }

  public renderGraph(graph: WorkflowGraph, analysis: CriticalPathAnalysis, selectedNodeId?: string, role: UserRole = "employer"): RenderStats {
    this.clear();
    const index = new SpatialIndex();
    const nodes = graph.getNodes();
    index.build(nodes);
    const visibleIds = index.query({ minX: -260, maxX: 1200, minY: -760, maxY: 760 });

    nodes.forEach((node) => {
      if (!visibleIds.has(node.id)) return;
      const mesh = this.nodeFactory.create(node, analysis, selectedNodeId, role);
      this.nodeMeshes.set(node.id, mesh);
      this.scene.add(mesh);
    });

    graph.getEdges().forEach((edge) => {
      if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) return;
      const line = this.edgeFactory.create(edge, graph, analysis);
      if (line) this.edgeGroup.add(line);
    });

    return {
      visibleNodes: visibleIds.size,
      culledNodes: Math.max(0, nodes.length - visibleIds.size),
      renderedEdges: this.edgeGroup.children.length,
    };
  }

  public onSelect(callback: (nodeId: string) => void): () => void {
    const handler = (event: PointerEvent) => {
      const id = this.raycaster.pick(event, this.renderer.domElement, this.camera, Array.from(this.nodeMeshes.values()));
      if (id) callback(id);
    };
    this.renderer.domElement.addEventListener("pointerdown", handler);
    return () => this.renderer.domElement.removeEventListener("pointerdown", handler);
  }

  public resize(): void {
    this.camera.aspect = this.host.clientWidth / this.host.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.host.clientWidth, this.host.clientHeight);
  }

  public dispose(): void {
    cancelAnimationFrame(this.frameId);
    this.clear();
    this.controls.dispose();
    this.renderer.dispose();
    this.host.removeChild(this.renderer.domElement);
  }

  private animate = (): void => {
    this.scene.rotation.z = Math.sin(Date.now() / 5000) * 0.012;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  private clear(): void {
    this.nodeMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
      else mesh.material.dispose();
    });
    this.nodeMeshes.clear();
    this.edgeGroup.children.forEach((child) => {
      const line = child as THREE.Line;
      line.geometry.dispose();
      if (Array.isArray(line.material)) line.material.forEach((material) => material.dispose());
      else line.material.dispose();
    });
    this.edgeGroup.clear();
  }
}
