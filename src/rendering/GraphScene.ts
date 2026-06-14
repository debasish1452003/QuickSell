import type { CriticalPathAnalysis, UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import { EdgeMeshFactory } from "@/rendering/EdgeMeshFactory";
import { GraphRaycaster } from "@/rendering/GraphRaycaster";
import { GraphViewportController } from "@/rendering/GraphViewportController";
import { NodeMeshFactory } from "@/rendering/NodeMeshFactory";
import { SpatialIndex } from "@/rendering/SpatialIndex";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

export interface RenderStats {
  visibleNodes: number;
  culledNodes: number;
  renderedEdges: number;
  criticalNodes: number;
  blockedNodes: number;
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
  private readonly renderedNodes = new Map<string, ReturnType<WorkflowGraph["getNodes"]>[number]>();
  private readonly edgeGroup = new THREE.Group();
  private readonly stagingGroup = new THREE.Group();
  private readonly viewport: GraphViewportController;
  private frameId = 0;

  public constructor(private readonly host: HTMLDivElement) {
    this.scene.background = new THREE.Color("#f8fbff");
    this.scene.fog = new THREE.Fog("#f8fbff", 620, 2100);
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
    this.viewport = new GraphViewportController(this.camera, this.controls);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.add(new THREE.HemisphereLight("#ffffff", "#d8e6f7", 1.15));
    const light = new THREE.DirectionalLight("#ffffff", 1.35);
    light.position.set(180, -250, 360);
    light.castShadow = true;
    this.scene.add(light);
    const fill = new THREE.DirectionalLight("#89b9ff", 0.75);
    fill.position.set(-240, 180, 220);
    this.scene.add(fill);
    const grid = new THREE.GridHelper(1260, 28, "#94a3b8", "#dbe5f0");
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -24;
    const gridMaterial = grid.material;
    if (Array.isArray(gridMaterial)) {
      gridMaterial.forEach((material) => {
        material.transparent = true;
        material.opacity = 0.38;
      });
    }
    this.stagingGroup.add(grid);
    const runway = new THREE.Mesh(
      new THREE.PlaneGeometry(1500, 860),
      new THREE.MeshStandardMaterial({ color: "#eef5fc", metalness: 0.08, roughness: 0.8 })
    );
    runway.position.set(380, 0, -34);
    runway.receiveShadow = true;
    this.stagingGroup.add(runway);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#2563eb", opacity: 0.08, transparent: true, side: THREE.DoubleSide });
    [160, 280, 410].forEach((radius) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 2, 96), ringMaterial.clone());
      ring.rotation.x = Math.PI / 2;
      ring.position.set(360, 0, -22);
      this.stagingGroup.add(ring);
    });
    this.scene.add(this.stagingGroup);
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
      this.renderedNodes.set(node.id, node);
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
      criticalNodes: analysis.criticalNodeIds.filter((id) => visibleIds.has(id)).length,
      blockedNodes: nodes.filter((node) => visibleIds.has(node.id) && node.status === "blocked").length,
    };
  }

  public focusNode(nodeId?: string): void {
    this.viewport.focusNode(nodeId ? this.renderedNodes.get(nodeId) : undefined);
  }

  public frameGraph(): void {
    this.viewport.frameGraph(Array.from(this.renderedNodes.values()));
  }

  public toggleAutoOrbit(): boolean {
    this.viewport.setAutoOrbit(!this.viewport.getAutoOrbit());
    return this.viewport.getAutoOrbit();
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
    this.viewport.tick(this.scene);
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
    this.renderedNodes.clear();
    this.edgeGroup.children.forEach((child) => {
      const line = child as THREE.Line;
      line.geometry.dispose();
      if (Array.isArray(line.material)) line.material.forEach((material) => material.dispose());
      else line.material.dispose();
    });
    this.edgeGroup.clear();
  }
}
