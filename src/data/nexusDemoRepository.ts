import { DependencyEdge } from "@/domain/workflow/DependencyEdge";
import { TaskNode } from "@/domain/workflow/TaskNode";
import type { TaskStatus, UserRole } from "@/domain/workflow/types";
import { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";

export interface NexusUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
}

export interface NexusProject {
  id: string;
  name: string;
  client: string;
  health: "on_track" | "risk" | "blocked";
  budgetUsed: number;
  releaseDate: string;
}

export class NexusDemoRepository {
  public getUsers(): NexusUser[] {
    return [
      { id: "u-admin", name: "Aarav Mehta", role: "admin", title: "Program Director" },
      { id: "u-member", name: "Neha Rao", role: "member", title: "Workflow Engineer" },
      { id: "u-client", name: "Client View", role: "client", title: "Stakeholder" },
      { id: "u-risk", name: "Ishan Roy", role: "member", title: "Risk Analyst" },
    ];
  }

  public getSession(role: UserRole = "admin"): NexusUser {
    return this.getUsers().find((user) => user.role === role) ?? this.getUsers()[0];
  }

  public getProjects(): NexusProject[] {
    return [
      {
        id: "px-core",
        name: "Atlas Settlement Engine",
        client: "Northstar Capital",
        health: "risk",
        budgetUsed: 68,
        releaseDate: "2026-09-30",
      },
      {
        id: "px-mobile",
        name: "Client Visibility Portal",
        client: "HelioWorks",
        health: "on_track",
        budgetUsed: 42,
        releaseDate: "2026-08-14",
      },
    ];
  }

  public createWorkflowGraph(size = 180): WorkflowGraph {
    const graph = new WorkflowGraph();
    const users = this.getUsers();
    const columns = Math.ceil(Math.sqrt(size));

    for (let index = 0; index < size; index += 1) {
      const layer = Math.floor(index / columns);
      const lane = index % columns;
      graph.addNode(new TaskNode({
        id: `task-${String(index + 1).padStart(4, "0")}`,
        title: this.getTaskTitle(index),
        durationHours: 2 + ((index * 7) % 19),
        status: this.getStatus(index),
        priority: 1 + (index % 4),
        ownerId: users[index % users.length].id,
        projectId: index % 2 === 0 ? "px-core" : "px-mobile",
        clientVisible: index % 5 !== 0,
        description: "Typed DAG task generated for NexusDAG planning and portfolio analysis.",
        position: {
          x: layer * 44,
          y: (lane - columns / 2) * 32,
          z: ((index * 13) % 29) - 14,
        },
      }));
    }

    const nodes = graph.getNodes();
    nodes.forEach((node, index) => {
      if (index === 0) return;
      const parent = nodes[Math.max(0, index - 1 - (index % 4))];
      if (parent) graph.addDependency(new DependencyEdge({ from: parent.id, to: node.id }));
      if (index > 8 && index % 6 === 0) {
        const secondary = nodes[index - 7];
        if (secondary) graph.addDependency(new DependencyEdge({ from: secondary.id, to: node.id, kind: "review_gate" }));
      }
    });

    return graph;
  }

  private getTaskTitle(index: number): string {
    const names = ["Schema migration", "Risk model", "Client approval", "Execution monitor", "Release gate", "Incident drill"];
    return `${names[index % names.length]} ${index + 1}`;
  }

  private getStatus(index: number): TaskStatus {
    const statuses: TaskStatus[] = ["backlog", "ready", "in_progress", "blocked", "review", "done"];
    return statuses[index % statuses.length];
  }
}

export const nexusRepository = new NexusDemoRepository();
