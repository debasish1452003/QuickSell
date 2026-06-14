import { Metric } from "@/components/Shared/Metric";
import type { SimulationReport } from "@/domain/workflow/types";

export function SimulationPanel({ report }: { report: SimulationReport | null }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <h2>Monte Carlo Stress</h2>
      </div>
      <div className="panel-body metric-grid">
        <Metric label="Iterations" value={report?.iterations ?? "Not run"} />
        <Metric label="Conflicts resolved" value={report?.conflictsResolved ?? 0} />
        <Metric label="Cycles rejected" value={report?.cyclesRejected ?? 0} />
        <Metric label="Critical path changes" value={report?.criticalPathChanges ?? 0} />
        <Metric label="Avg recalc" value={report ? `${report.averageRecalculationMs.toFixed(3)}ms` : "0ms"} />
        <Metric label="P95 recalc" value={report ? `${report.p95RecalculationMs.toFixed(3)}ms` : "0ms"} />
      </div>
    </article>
  );
}
