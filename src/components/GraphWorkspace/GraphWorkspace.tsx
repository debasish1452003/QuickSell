"use client";

import { useEffect, useRef, useState } from "react";
import type { CriticalPathAnalysis } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import { GraphScene, type RenderStats } from "@/rendering/GraphScene";
import "./GraphWorkspace.css";

export function GraphWorkspace({ graph, analysis, selectedNodeId, onSelectNode }: {
  graph: WorkflowGraph;
  analysis: CriticalPathAnalysis;
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GraphScene | null>(null);
  const [stats, setStats] = useState<RenderStats>({ visibleNodes: 0, culledNodes: 0, renderedEdges: 0 });

  useEffect(() => {
    if (!hostRef.current) return;
    const scene = new GraphScene(hostRef.current);
    sceneRef.current = scene;
    const removeSelect = scene.onSelect(onSelectNode);
    const handleResize = () => scene.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      removeSelect();
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [onSelectNode]);

  useEffect(() => {
    if (!sceneRef.current) return;
    setStats(sceneRef.current.renderGraph(graph, analysis, selectedNodeId));
  }, [graph, analysis, selectedNodeId]);

  return (
    <article className="panel graph-workspace">
      <div className="panel-header">
        <div>
          <h2>Three.js DAG Planner</h2>
          <p>Critical path nodes are red. Selected task is blue. Offscreen nodes are culled through a spatial grid.</p>
        </div>
        <div className="render-stats">
          <span>{stats.visibleNodes} visible</span>
          <span>{stats.culledNodes} culled</span>
          <span>{stats.renderedEdges} edges</span>
        </div>
      </div>
      <div className="graph-canvas" ref={hostRef} aria-label="NexusDAG Three.js dependency graph" />
    </article>
  );
}
