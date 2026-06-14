import { Metric } from "@/components/Shared/Metric";
import type { TaskNode } from "@/domain/workflow/TaskNode";
import type { NodeSchedule, UserRole } from "@/domain/workflow/types";
import "./InspectorPanel.css";

export function InspectorPanel({ node, schedule, role }: { node?: TaskNode; schedule?: NodeSchedule; role: UserRole }) {
  return (
    <article className="panel inspector">
      <div className="panel-header">
        <h2>Task Inspector</h2>
        <span>{role === "client" ? "Read only" : "Editable"}</span>
      </div>
      {node ? (
        <div className="panel-body">
          <p className="eyebrow">{node.id}</p>
          <h3>{node.title}</h3>
          <p className="description">{node.description}</p>
          <div className="metric-grid">
            <Metric label="Duration" value={`${node.durationHours}h`} />
            <Metric label="Status" value={node.status.replace("_", " ")} />
            <Metric label="Slack" value={`${schedule?.slack ?? 0}h`} />
            <Metric label="Critical" value={schedule?.isCritical ? "Yes" : "No"} />
          </div>
        </div>
      ) : (
        <div className="panel-body">Select a task to inspect its schedule.</div>
      )}
    </article>
  );
}
