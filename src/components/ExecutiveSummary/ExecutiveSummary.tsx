import { Metric } from "@/components/Shared/Metric";
import type { PortfolioAnalytics } from "@/domain/workflow/ProjectAnalyticsEngine";
import type { CriticalPathAnalysis, UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";

export function ExecutiveSummary({
  graph,
  analysis,
  role,
  analytics,
}: {
  graph: WorkflowGraph;
  analysis: CriticalPathAnalysis;
  role: UserRole;
  analytics: PortfolioAnalytics;
}) {
  const visibleTasks = role === "client" ? graph.getNodes().filter((node) => node.clientVisible).length : graph.getNodes().length;

  return (
    <article className="panel">
      <div className="panel-header">
        <h2>{role === "employee" ? "My Work Summary" : role === "client" ? "Client Delivery Summary" : "Executive Summary"}</h2>
      </div>
      <div className="panel-body metric-grid">
        <Metric label="Visible tasks" value={visibleTasks.toLocaleString()} />
        <Metric label="Completion" value={`${analytics.completionRate}%`} />
        <Metric label="Critical path" value={`${analysis.criticalNodeIds.length} tasks`} />
        <Metric label="Delayed tasks" value={analytics.delayedTasks} />
        <Metric label="Overdue time" value={`${analytics.overdueHours}h`} />
        <Metric label="Review queue" value={analytics.reviewQueue} />
      </div>
    </article>
  );
}
