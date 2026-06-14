"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell/AppShell";
import { CommandBar } from "@/components/CommandBar/CommandBar";
import { ExecutiveSummary } from "@/components/ExecutiveSummary/ExecutiveSummary";
import { GraphWorkspace } from "@/components/GraphWorkspace/GraphWorkspace";
import { InspectorPanel } from "@/components/InspectorPanel/InspectorPanel";
import { KanbanBoard } from "@/components/KanbanBoard/KanbanBoard";
import { ProjectPortfolio } from "@/components/ProjectPortfolio/ProjectPortfolio";
import { SimulationPanel } from "@/components/SimulationPanel/SimulationPanel";
import type { DashboardPayload } from "@/data/DashboardService";
import type { SimulationReport, UserRole } from "@/domain/workflow/types";
import { hydrateGraph } from "@/lib/workflowHydration";

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>("employer");
  const [graphSize, setGraphSize] = useState(180);
  const [selectedNodeId, setSelectedNodeId] = useState("task-0001");
  const [simulation, setSimulation] = useState<SimulationReport | null>(null);
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("nexusdag-role") as UserRole | null;
    if (saved) setRole(saved);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/dashboard?role=${role}&size=${graphSize}`, { cache: "no-store" });
    const next = await response.json();
    setPayload(next);
    setSelectedNodeId(next.nodes[0]?.id ?? "");
    setLoading(false);
  }, [graphSize, role]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const graphState = useMemo(() => (payload ? hydrateGraph(payload) : null), [payload]);
  const selectedNode = graphState?.graph.getNode(selectedNodeId) ?? graphState?.graph.getNodes()[0];

  const handleRoleChange = (nextRole: UserRole) => {
    window.localStorage.setItem("nexusdag-role", nextRole);
    setRole(nextRole);
  };

  const runSimulation = async () => {
    const response = await fetch("/api/simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: graphSize, iterations: 3000 }),
    });
    const result = await response.json();
    setSimulation(result.report);
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
            onGraphSizeChange={setGraphSize}
            onRunSimulation={runSimulation}
          />
        ) : null}
        {loading || !payload || !graphState ? (
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
                onSelectNode={setSelectedNodeId}
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
