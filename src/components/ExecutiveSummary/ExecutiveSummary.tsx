import { Metric } from "@/components/Shared/Metric";
import type { CriticalPathAnalysis, UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";

export function ExecutiveSummary({ graph, analysis, role }: { graph: WorkflowGraph; analysis: CriticalPathAnalysis; role: UserRole }) {
  const blocked = graph.getNodes().filter((node) => node.status === "blocked").length;
  const visibleTasks = role === "client" ? graph.getNodes().filter((node) => node.clientVisible).length : graph.getNodes().length;

  return (
    <article className="panel">
      <div className="panel-header">
        <h2>Executive Summary</h2>
      </div>
      <div className="panel-body metric-grid">
        <Metric label="Visible tasks" value={visibleTasks.toLocaleString()} />
        <Metric label="Critical path" value={`${analysis.criticalNodeIds.length} tasks`} />
        <Metric label="Minimum duration" value={`${analysis.projectDuration}h`} />
        <Metric label="Blocked work" value={blocked} />
      </div>
    </article>
  );
}
