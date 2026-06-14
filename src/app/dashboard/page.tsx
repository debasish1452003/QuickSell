"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { AppShell } from "@/components/AppShell/AppShell";
import { CommandBar } from "@/components/CommandBar/CommandBar";
import { ExecutiveSummary } from "@/components/ExecutiveSummary/ExecutiveSummary";
import { GraphWorkspace } from "@/components/GraphWorkspace/GraphWorkspace";
import { InspectorPanel } from "@/components/InspectorPanel/InspectorPanel";
import { KanbanBoard } from "@/components/KanbanBoard/KanbanBoard";
import { ProjectPortfolio } from "@/components/ProjectPortfolio/ProjectPortfolio";
import { SimulationPanel } from "@/components/SimulationPanel/SimulationPanel";
import type { UserRole } from "@/domain/workflow/types";
import { hydrateGraph } from "@/lib/workflowHydration";
import { dashboardReducer, initialDashboardState } from "./dashboardReducer";

export default function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);
  const { role, graphSize, selectedNodeId, simulation, simulationRunning, payload, loading, error } = state;
  const hasLoadedDashboard = Boolean(payload);

  const loadDashboard = useCallback(async () => {
    dispatch({ type: "dashboardLoading" });
    const params = new URLSearchParams({ size: String(graphSize) });
    if (hasLoadedDashboard) params.set("role", role);
    const response = await fetch(`/api/dashboard?${params.toString()}`, { cache: "no-store" });
    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (!response.ok) {
      dispatch({ type: "dashboardFailed", error: "Dashboard intelligence could not be loaded." });
      return;
    }
    const next = await response.json();
    dispatch({ type: "dashboardLoaded", payload: next });
  }, [graphSize, hasLoadedDashboard, role]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const graphState = useMemo(() => (payload ? hydrateGraph(payload) : null), [payload]);
  const selectedNode = graphState?.graph.getNode(selectedNodeId) ?? graphState?.graph.getNodes()[0];

  const handleRoleChange = (nextRole: UserRole) => {
    dispatch({ type: "roleChanged", role: nextRole });
  };

  const runSimulation = async () => {
    dispatch({ type: "simulationStarted" });
    try {
      const response = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size: graphSize, iterations: 3000 }),
      });
      if (!response.ok) {
        dispatch({ type: "simulationFailed" });
        return;
      }
      const result = await response.json();
      dispatch({ type: "simulationCompleted", report: result.report });
    } catch {
      dispatch({ type: "simulationFailed" });
    }
  };

  return (
    <AppShell user={payload?.user} projects={payload?.projects} submissions={payload?.submissions}>
      <main className="nexus-app">
        {payload ? (
          <CommandBar
            role={role}
            user={payload.user}
            graphSize={graphSize}
            onRoleChange={handleRoleChange}
            onGraphSizeChange={(size) => dispatch({ type: "graphSizeChanged", graphSize: size })}
            onRunSimulation={runSimulation}
            simulationRunning={simulationRunning}
          />
        ) : null}
        {error ? (
          <section className="loading-state">{error}</section>
        ) : loading || !payload || !graphState ? (
          <section className="loading-state">Loading role-aware workflow intelligence...</section>
        ) : (
          <div className="workspace">
            <section className="left-rail" aria-label="Portfolio and project controls">
              <ExecutiveSummary graph={graphState.graph} analysis={graphState.analysis} role={role} analytics={payload.analytics} />
              <ProjectPortfolio projects={payload.projects} analytics={payload.analytics} />
            </section>
            <section className="center-stage" aria-label="Workflow planning views">
              <GraphWorkspace
                graph={graphState.graph}
                analysis={graphState.analysis}
                selectedNodeId={selectedNode?.id}
                role={role}
                delays={payload.analytics.delayAnalyses}
                onSelectNode={(nodeId) => dispatch({ type: "nodeSelected", nodeId })}
              />
              <KanbanBoard
                graph={graphState.graph}
                role={role}
                users={payload.users}
                delays={payload.analytics.delayAnalyses}
                submissions={payload.submissions}
              />
            </section>
            <section className="right-rail" aria-label="Task and simulation details">
              <InspectorPanel
                node={selectedNode}
                schedule={selectedNode ? graphState.analysis.nodeSchedule.get(selectedNode.id) : undefined}
                role={role}
                users={payload.users}
                delay={payload.analytics.delayAnalyses.find((item) => item.taskId === selectedNode?.id)}
                permissions={payload.permissions}
                currentUser={payload.user}
              />
              <SimulationPanel report={simulation} />
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}
