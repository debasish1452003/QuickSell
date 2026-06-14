"use client";

import { Activity, Crosshair, GitBranch, Maximize2, Radar, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CriticalPathAnalysis, UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import { GraphScene, type RenderStats } from "@/rendering/GraphScene";
import "./GraphWorkspace.css";

export function GraphWorkspace({ graph, analysis, selectedNodeId, role, onSelectNode }: {
  graph: WorkflowGraph;
  analysis: CriticalPathAnalysis;
  selectedNodeId?: string;
  role?: UserRole;
  onSelectNode: (id: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GraphScene | null>(null);
  const [stats, setStats] = useState<RenderStats>({ visibleNodes: 0, culledNodes: 0, renderedEdges: 0, criticalNodes: 0, blockedNodes: 0 });
  const [autoOrbit, setAutoOrbit] = useState(true);

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
    setStats(sceneRef.current.renderGraph(graph, analysis, selectedNodeId, role));
  }, [graph, analysis, selectedNodeId, role]);

  return (
    <article className="panel graph-workspace">
      <div className="graph-hero">
        <div className="graph-title-block">
          <span className="graph-kicker"><ShieldCheck size={14} /> NexusDAG Control Plane</span>
          <h2>Dependency Intelligence Planner</h2>
          <p>Executive-grade workstream map with critical path focus, dependency gates, blocker telemetry, and role-aware planning visibility.</p>
        </div>
        <div className="graph-toolbar" aria-label="Graph controls">
          <button type="button" onClick={() => sceneRef.current?.focusNode(selectedNodeId)} title="Focus selected task">
            <Crosshair size={15} />
            Focus
          </button>
          <button type="button" onClick={() => sceneRef.current?.frameGraph()} title="Frame graph">
            <Maximize2 size={15} />
            Frame
          </button>
          <button type="button" onClick={() => setAutoOrbit(Boolean(sceneRef.current?.toggleAutoOrbit()))} title="Toggle auto orbit">
            <RotateCcw size={15} />
            {autoOrbit ? "Orbit" : "Still"}
          </button>
        </div>
      </div>
      <div className="graph-command-strip">
        <span><GitBranch size={14} /> Gate overlay active</span>
        <span><Radar size={14} /> Risk scan live</span>
        <span><Activity size={14} /> SLA drift monitored</span>
      </div>
      <div className="graph-canvas-shell">
        <div className="graph-canvas" ref={hostRef} aria-label="NexusDAG dependency intelligence graph" />
        <div className="graph-overlay-card">
          <strong>Planning Telemetry</strong>
          <div className="render-stats" aria-label="Render telemetry">
            <span>{stats.visibleNodes} visible nodes</span>
            <span>{stats.criticalNodes} critical</span>
            <span>{stats.blockedNodes} blockers</span>
            <span>{stats.renderedEdges} dependencies</span>
            <span>{stats.culledNodes} optimized</span>
          </div>
        </div>
      </div>
    </article>
  );
}
