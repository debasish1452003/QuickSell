"use client";

import { useMemo, useState } from "react";
import { CommandBar } from "@/components/CommandBar/CommandBar";
import { ExecutiveSummary } from "@/components/ExecutiveSummary/ExecutiveSummary";
import { GraphWorkspace } from "@/components/GraphWorkspace/GraphWorkspace";
import { InspectorPanel } from "@/components/InspectorPanel/InspectorPanel";
import { KanbanBoard } from "@/components/KanbanBoard/KanbanBoard";
import { ProjectPortfolio } from "@/components/ProjectPortfolio/ProjectPortfolio";
import { SimulationPanel } from "@/components/SimulationPanel/SimulationPanel";
import { nexusRepository } from "@/data/nexusDemoRepository";
import { CriticalPathEngine } from "@/domain/workflow/CriticalPathEngine";
import { SimulationEngine } from "@/domain/workflow/SimulationEngine";
import type { SimulationReport, UserRole } from "@/domain/workflow/types";

export default function Home() {
  const [role, setRole] = useState<UserRole>("admin");
  const [graphSize, setGraphSize] = useState(180);
  const [selectedNodeId, setSelectedNodeId] = useState("task-0001");
  const [simulation, setSimulation] = useState<SimulationReport | null>(null);

  const user = useMemo(() => nexusRepository.getSession(role), [role]);
  const projects = useMemo(() => nexusRepository.getProjects(), []);
  const graph = useMemo(() => nexusRepository.createWorkflowGraph(graphSize), [graphSize]);
  const analysis = useMemo(() => new CriticalPathEngine().analyze(graph), [graph]);
  const selectedNode = graph.getNode(selectedNodeId) ?? graph.getNodes()[0];

  const runSimulation = () => {
    setSimulation(new SimulationEngine(2026).run(graph, 3000));
  };

  return (
    <main className="nexus-app">
      <CommandBar
        role={role}
        user={user}
        graphSize={graphSize}
        onRoleChange={setRole}
        onGraphSizeChange={setGraphSize}
        onRunSimulation={runSimulation}
      />
      <div className="workspace">
        <section className="left-rail" aria-label="Portfolio and project controls">
          <ExecutiveSummary graph={graph} analysis={analysis} role={role} />
          <ProjectPortfolio projects={projects} />
        </section>
        <section className="center-stage" aria-label="Workflow planning views">
          <GraphWorkspace
            graph={graph}
            analysis={analysis}
            selectedNodeId={selectedNode?.id}
            onSelectNode={setSelectedNodeId}
          />
          <KanbanBoard graph={graph} role={role} />
        </section>
        <section className="right-rail" aria-label="Task and simulation details">
          <InspectorPanel node={selectedNode} schedule={selectedNode ? analysis.nodeSchedule.get(selectedNode.id) : undefined} role={role} />
          <SimulationPanel report={simulation} />
        </section>
      </div>
    </main>
  );
}
