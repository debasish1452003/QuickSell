import type { UserRole } from "@/domain/workflow/types";
import type { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";
import "./KanbanBoard.css";

const columns = ["backlog", "ready", "in_progress", "blocked", "review", "done"] as const;

export function KanbanBoard({ graph, role }: { graph: WorkflowGraph; role: UserRole }) {
  const tasks = graph.getNodes().filter((node) => role !== "client" || node.clientVisible).slice(0, 60);

  return (
    <article className="panel kanban-panel">
      <div className="panel-header">
        <h2>Kanban Execution Board</h2>
        <span>{role === "client" ? "Client-safe tasks" : "Operational view"}</span>
      </div>
      <div className="kanban-board">
        {columns.map((column) => (
          <section className="kanban-column" key={column}>
            <header>
              <h3>{column.replace("_", " ")}</h3>
              <strong>{tasks.filter((task) => task.status === column).length}</strong>
            </header>
            {tasks.filter((task) => task.status === column).slice(0, 6).map((task) => (
              <div className="task-card" key={task.id}>
                <span>{task.id}</span>
                <h4>{task.title}</h4>
                <p>{task.durationHours}h · P{task.priority}</p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
