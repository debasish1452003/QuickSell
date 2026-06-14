"use client";

import { Activity, Crosshair, Eye, GitBranch, Maximize2, Radar, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CriticalPathAnalysis, DelayAnalysis, UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import { GraphScene, type RenderStats } from "@/rendering/GraphScene";
import "./GraphWorkspace.css";

export function GraphWorkspace({ graph, analysis, selectedNodeId, role, delays, onSelectNode }: {
  graph: WorkflowGraph;
  analysis: CriticalPathAnalysis;
  selectedNodeId?: string;
  role?: UserRole;
  delays?: DelayAnalysis[];
  onSelectNode: (id: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GraphScene | null>(null);
  const [stats, setStats] = useState<RenderStats>({
    visibleNodes: 0,
    culledNodes: 0,
    renderedEdges: 0,
    criticalNodes: 0,
    blockedNodes: 0,
    highRiskNodes: 0,
    overdueNodes: 0,
    gatedEdges: 0,
  });
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [gateOverlay, setGateOverlay] = useState(true);
  const [riskScan, setRiskScan] = useState(true);
  const [slaDrift, setSlaDrift] = useState(true);
  const selectedNode = useMemo(() => (selectedNodeId ? graph.getNode(selectedNodeId) : undefined), [graph, selectedNodeId]);
  const selectedSchedule = selectedNodeId ? analysis.nodeSchedule.get(selectedNodeId) : undefined;
  const selectedDelay = delays?.find((item) => item.taskId === selectedNodeId);
  const focusSelectedNode = () => {
    sceneRef.current?.focusNode(selectedNodeId);
    setAutoOrbit(false);
  };
  const frameFullGraph = () => {
    sceneRef.current?.frameGraph();
    setAutoOrbit(false);
  };

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
    setStats(sceneRef.current.renderGraph(graph, analysis, selectedNodeId, role, { gateOverlay, riskScan, slaDrift, delays: delays ?? [] }));
  }, [graph, analysis, selectedNodeId, role, gateOverlay, riskScan, slaDrift, delays]);

  return (
    <article className="panel graph-workspace">
      <div className="graph-hero">
        <div className="graph-title-block">
          <span className="graph-kicker"><ShieldCheck size={14} /> NexusDAG Control Plane</span>
          <h2>Dependency Intelligence Planner</h2>
          <p>Executive-grade workstream map with critical path focus, dependency gates, blocker telemetry, and role-aware planning visibility.</p>
        </div>
        <div className="graph-toolbar" aria-label="Graph controls">
          <button type="button" onClick={focusSelectedNode} title="Focus selected task" data-active={Boolean(selectedNodeId)}>
            <Crosshair size={15} />
            Focus
          </button>
          <button type="button" onClick={frameFullGraph} title="Frame full DAG">
            <Maximize2 size={15} />
            Frame
          </button>
          <button type="button" onClick={() => setAutoOrbit(Boolean(sceneRef.current?.toggleAutoOrbit()))} title="Toggle auto orbit" data-active={autoOrbit}>
            <RotateCcw size={15} />
            {autoOrbit ? "Orbit" : "Still"}
          </button>
        </div>
      </div>
      <div className="graph-command-strip">
        <button type="button" onClick={() => setGateOverlay((value) => !value)} data-active={gateOverlay}>
          <GitBranch size={14} /> Gate overlay {gateOverlay ? "active" : "paused"}
        </button>
        <button type="button" onClick={() => setRiskScan((value) => !value)} data-active={riskScan}>
          <Radar size={14} /> Risk scan {riskScan ? "live" : "paused"}
        </button>
        <button type="button" onClick={() => setSlaDrift((value) => !value)} data-active={slaDrift}>
          <Activity size={14} /> SLA drift {slaDrift ? "monitored" : "paused"}
        </button>
        <span><Sparkles size={14} /> Interactive DAG lens</span>
      </div>
      <div className="graph-canvas-shell">
        <div className="graph-canvas" ref={hostRef} aria-label="NexusDAG dependency intelligence graph" />
        {selectedNode ? (
          <div className="graph-selection-card">
            <span><Eye size={13} /> Selected Task</span>
            <strong>{selectedNode.title}</strong>
            <p>{selectedNode.status.replace("_", " ")} | {selectedSchedule?.slack ?? 0}h slack | {selectedDelay?.riskLevel ?? "low"} risk</p>
          </div>
        ) : null}
        <div className="graph-overlay-card">
          <strong>Planning Telemetry</strong>
          <div className="render-stats" aria-label="Render telemetry">
            <span>{stats.visibleNodes} visible nodes</span>
            <span>{stats.criticalNodes} critical</span>
            <span>{stats.blockedNodes} blockers</span>
            <span>{stats.highRiskNodes} high risk</span>
            <span>{stats.overdueNodes} SLA drift</span>
            <span>{stats.gatedEdges} gated edges</span>
            <span>{stats.renderedEdges} dependencies</span>
            <span>{stats.culledNodes} optimized</span>
          </div>
        </div>
      </div>
    </article>
  );
}
