import type { NexusUser } from "@/data/ProjectRepository";
import type { DelayAnalysis, TaskSubmission, UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import "./KanbanBoard.css";

const columns = ["backlog", "ready", "in_progress", "blocked", "review", "done"] as const;

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
  const tasks = graph.getNodes().filter((node) => role !== "client" || node.clientVisible).slice(0, 60);

  return (
    <article className="panel kanban-panel">
      <div className="panel-header">
        <h2>Kanban Execution Board</h2>
        <span>{role === "client" ? "Approved client view" : role === "employee" ? "Assigned work" : "Portfolio operations"}</span>
      </div>
      <div className="kanban-board">
        {columns.map((column) => (
          <section className="kanban-column" key={column}>
            <header>
              <h3>{column.replace("_", " ")}</h3>
              <strong>{tasks.filter((task) => task.status === column).length}</strong>
            </header>
            {tasks.filter((task) => task.status === column).slice(0, 6).map((task) => {
              const delay = delays.find((item) => item.taskId === task.id);
              const owner = users.find((user) => user.id === task.ownerId);
              const pending = submissions.some((submission) => submission.taskId === task.id && submission.status === "submitted");

              return (
                <div className="task-card" key={task.id} data-risk={delay?.riskLevel ?? "low"}>
                  <span>{task.id}</span>
                  <h4>{task.title}</h4>
                  <p>{task.durationHours}h - P{task.priority} - {owner?.name ?? "Unassigned"}</p>
                  <small>Due {formatDate(task.dueDate)} - {task.reviewStatus.replace("_", " ")}</small>
                  {delay?.isOverdue ? <em>{delay.delayedByDays}d delayed</em> : null}
                  {pending ? <b>Review pending</b> : null}
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </article>
  );
}

function formatDate(value: string): string {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
