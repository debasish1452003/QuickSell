"use client";

import { AlertTriangle, BarChart3, Clock3, Filter, GripVertical, Search, ShieldAlert, UserRoundCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { NexusUser } from "@/data/ProjectRepository";
import type { DelayAnalysis, TaskStatus, TaskSubmission, UserRole } from "@/domain/workflow/types";
import type { TaskNode } from "@/domain/workflow/TaskNode";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import "./KanbanBoard.css";

const columns = ["backlog", "ready", "in_progress", "blocked", "review", "done"] as const;
const wipLimits: Record<TaskStatus, number> = {
  backlog: 12,
  ready: 10,
  in_progress: 8,
  blocked: 5,
  review: 7,
  done: 99,
};

type BoardTask = TaskNode & { boardStatus: TaskStatus };

export function KanbanBoard({
  graph,
  role,
  users,
  delays,
  submissions,
}: {
  graph: WorkflowGraph;
  role: UserRole;
  users: NexusUser[];
  delays: DelayAnalysis[];
  submissions: TaskSubmission[];
}) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TaskStatus>>({});
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const tasks = useMemo<BoardTask[]>(() => {
    return graph
      .getNodes()
      .filter((node) => role !== "client" || node.clientVisible)
      .map((node) => Object.assign(node, { boardStatus: statusOverrides[node.id] ?? node.status }))
      .filter((task) => ownerFilter === "all" || task.ownerId === ownerFilter)
      .filter((task) => {
        const delay = delays.find((item) => item.taskId === task.id);
        return riskFilter === "all" || (delay?.riskLevel ?? "low") === riskFilter;
      })
      .filter((task) => {
        const text = `${task.id} ${task.title} ${task.description}`.toLowerCase();
        return text.includes(query.trim().toLowerCase());
      })
      .slice(0, 96);
  }, [delays, graph, ownerFilter, query, riskFilter, role, statusOverrides]);

  const overdueCount = tasks.filter((task) => delays.some((delay) => delay.taskId === task.id && delay.isOverdue)).length;
  const reviewQueue = tasks.filter((task) => submissions.some((submission) => submission.taskId === task.id && submission.status === "submitted")).length;
  const totalHours = tasks.reduce((sum, task) => sum + task.durationHours, 0);

  return (
    <article className="panel kanban-panel">
      <div className="kanban-hero">
        <div>
          <span className="kanban-kicker"><BarChart3 size={14} /> Execution Command Board</span>
          <h2>Kanban Operations, Review Flow, and Risk Trace</h2>
          <p>{role === "client" ? "Approved client delivery view with milestone evidence." : role === "employee" ? "Assigned work queue with review and blocker visibility." : "Portfolio operations view for capacity, dependency risk, and governance follow-up."}</p>
        </div>
        <div className="kanban-summary-grid">
          <SummaryMetric label="Tracked work" value={tasks.length} />
          <SummaryMetric label="Open risk" value={overdueCount} tone={overdueCount > 0 ? "risk" : "ok"} />
          <SummaryMetric label="Review queue" value={reviewQueue} />
          <SummaryMetric label="Capacity hrs" value={totalHours} />
        </div>
      </div>
      <div className="kanban-controls">
        <label className="kanban-search">
          <Search size={15} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search task, dependency, owner note" />
        </label>
        <label>
          <Filter size={15} />
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option value="all">All owners</option>
            {users.filter((user) => user.role === "employee").map((user) => (
              <option value={user.id} key={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
        <label>
          <ShieldAlert size={15} />
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
            <option value="all">All risks</option>
            <option value="high">High risk</option>
            <option value="medium">Medium risk</option>
            <option value="low">Low risk</option>
          </select>
        </label>
        <button type="button" onClick={() => setStatusOverrides({})}>Reset board</button>
      </div>
      <div className="kanban-board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.boardStatus === column);
          const wipPressure = Math.round((columnTasks.length / wipLimits[column]) * 100);
          return (
          <section
            className="kanban-column"
            data-hot={wipPressure > 100 ? "true" : "false"}
            key={column}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const taskId = event.dataTransfer.getData("text/task-id") || draggingTaskId;
              if (!taskId) return;
              setStatusOverrides((current) => ({ ...current, [taskId]: column }));
              setDraggingTaskId(null);
            }}
          >
            <header>
              <div>
                <h3>{column.replace("_", " ")}</h3>
                <span>WIP {columnTasks.length}/{wipLimits[column]}</span>
              </div>
              <strong>{columnTasks.length}</strong>
            </header>
            <div className="wip-meter"><span style={{ width: `${Math.min(100, wipPressure)}%` }} /></div>
            {columnTasks.map((task) => {
              const delay = delays.find((item) => item.taskId === task.id);
              const owner = users.find((user) => user.id === task.ownerId);
              const pending = submissions.some((submission) => submission.taskId === task.id && submission.status === "submitted");
              const blocked = task.boardStatus === "blocked" || Boolean(delay?.isOverdue);

              return (
                <div
                  className="task-card"
                  draggable
                  key={task.id}
                  data-risk={delay?.riskLevel ?? "low"}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/task-id", task.id);
                    event.dataTransfer.effectAllowed = "move";
                    setDraggingTaskId(task.id);
                  }}
                  onDragEnd={() => setDraggingTaskId(null)}
                >
                  <div className="task-card-topline">
                    <span>{task.id}</span>
                    <GripVertical size={15} />
                  </div>
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <div className="task-meta-grid">
                    <small><UserRoundCheck size={13} />{owner?.name ?? "Unassigned"}</small>
                    <small><Clock3 size={13} />{task.durationHours}h · P{task.priority}</small>
                    <small>Due {formatDate(task.dueDate)}</small>
                    <small>{task.reviewStatus.replace("_", " ")}</small>
                  </div>
                  <div className="task-badges">
                    {blocked ? <em><AlertTriangle size={12} />{delay?.isOverdue ? `${delay.delayedByDays}d delayed` : "Blocked"}</em> : null}
                    {pending ? <b>Review pending</b> : null}
                    {delay?.riskLevel ? <i>{delay.riskLevel} risk</i> : null}
                  </div>
                </div>
              );
            })}
            {columnTasks.length === 0 ? <p className="empty-column">Drop work here to rebalance execution.</p> : null}
          </section>
        )})}
      </div>
    </article>
  );
}

function SummaryMetric({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "risk" | "ok" }) {
  return (
    <div className="kanban-summary" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDate(value: string): string {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
