import { DependencyEdge } from "@/domain/workflow/DependencyEdge";
import { TaskNode } from "@/domain/workflow/TaskNode";
import type { ProjectHealth, ProjectMilestone, ReviewStatus, TaskStatus, TaskSubmission, UserRole } from "@/domain/workflow/types";
import { WorkflowGraph } from "@/domain/workflow/WorkflowGraph";

export interface NexusUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
}

export interface NexusProject {
  id: string;
  name: string;
  client: string;
  clientUserId: string;
  employeeIds: string[];
  health: ProjectHealth;
  budgetUsed: number;
  releaseDate: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export class ProjectRepository {
  private readonly users: NexusUser[] = [
    { id: "u-employer", name: "Aarav Mehta", email: "employer@nexusdag.dev", role: "employer", title: "Program Director" },
    { id: "u-employee", name: "Neha Rao", email: "employee@nexusdag.dev", role: "employee", title: "Workflow Engineer" },
    { id: "u-risk", name: "Ishan Roy", email: "risk@nexusdag.dev", role: "employee", title: "Risk Analyst" },
    { id: "u-client", name: "Maya Kapoor", email: "client@nexusdag.dev", role: "client", title: "Client Stakeholder" },
  ];

  private readonly submissions: TaskSubmission[] = [
    {
      id: "sub-001",
      taskId: "task-0003",
      projectId: "px-core",
      employeeId: "u-employee",
      submittedAt: "2026-06-13T15:30:00+05:30",
      status: "submitted",
      notes: "Client approval packet uploaded with dependency notes.",
    },
    {
      id: "sub-002",
      taskId: "task-0012",
      projectId: "px-mobile",
      employeeId: "u-risk",
      submittedAt: "2026-06-12T11:00:00+05:30",
      status: "approved",
      notes: "Release smoke checklist accepted.",
    },
  ];

  public getUsers(): NexusUser[] {
    return [...this.users];
  }

  public getUserById(id: string): NexusUser | undefined {
    return this.users.find((user) => user.id === id);
  }

  public getUserByRole(role: UserRole): NexusUser {
    return this.users.find((user) => user.role === role) ?? this.users[0];
  }

  public createUser(input: { name: string; email: string; role: UserRole; title?: string }): NexusUser {
    const existing = this.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
    if (existing) return existing;
    const next: NexusUser = {
      id: `u-${input.role}-${this.users.length + 1}`,
      name: input.name,
      email: input.email,
      role: input.role,
      title: input.title ?? this.defaultTitle(input.role),
    };
    this.users.push(next);
    return next;
  }

  public getProjects(): NexusProject[] {
    return [
      {
        id: "px-core",
        name: "Atlas Settlement Engine",
        client: "Northstar Capital",
        clientUserId: "u-client",
        employeeIds: ["u-employee", "u-risk"],
        health: "risk",
        budgetUsed: 68,
        releaseDate: "2026-09-30",
      },
      {
        id: "px-mobile",
        name: "Client Visibility Portal",
        client: "HelioWorks",
        clientUserId: "u-client",
        employeeIds: ["u-employee"],
        health: "on_track",
        budgetUsed: 42,
        releaseDate: "2026-08-14",
      },
    ];
  }

  public getMilestones(): ProjectMilestone[] {
    return [
      { id: "ms-001", projectId: "px-core", title: "Risk model sign-off", dueDate: "2026-06-18", status: "upcoming" },
      { id: "ms-002", projectId: "px-core", title: "Settlement rehearsal", dueDate: "2026-07-02", status: "upcoming" },
      { id: "ms-003", projectId: "px-mobile", title: "Client beta review", dueDate: "2026-06-10", status: "late" },
      { id: "ms-004", projectId: "px-mobile", title: "Pilot release", dueDate: "2026-06-24", status: "upcoming" },
    ];
  }

  public getSubmissions(): TaskSubmission[] {
    return [...this.submissions];
  }

  public submitTaskForReview(taskId: string, employeeId: string, notes: string): TaskSubmission {
    const task = this.createWorkflowGraph(180).getNode(taskId);
    const next: TaskSubmission = {
      id: `sub-${String(this.submissions.length + 1).padStart(3, "0")}`,
      taskId,
      projectId: task?.projectId ?? "px-core",
      employeeId,
      submittedAt: new Date().toISOString(),
      status: "submitted",
      notes,
    };
    this.submissions.unshift(next);
    return next;
  }

  public createWorkflowGraph(size = 180): WorkflowGraph {
    const graph = new WorkflowGraph();
    const users = this.getUsers().filter((user) => user.role === "employee");
    const columns = Math.ceil(Math.sqrt(size));
    const baseDate = new Date("2026-06-01T09:00:00+05:30");

    for (let index = 0; index < size; index += 1) {
      const layer = Math.floor(index / columns);
      const lane = index % columns;
      const status = this.getStatus(index);
      const plannedStart = new Date(baseDate.getTime() + index * DAY_MS);
      const dueDate = new Date(plannedStart.getTime() + (2 + (index % 6)) * DAY_MS);
      const isDelayed = index % 7 === 0 || status === "blocked";
      const actualEnd = status === "done" ? new Date(dueDate.getTime() + (isDelayed ? DAY_MS : -DAY_MS)).toISOString() : "";
      const reviewStatus = this.getReviewStatus(index, status);

      graph.addNode(new TaskNode({
        id: `task-${String(index + 1).padStart(4, "0")}`,
        title: this.getTaskTitle(index),
        durationHours: 2 + ((index * 7) % 19),
        status,
        priority: 1 + (index % 4),
        ownerId: users[index % users.length].id,
        projectId: index % 2 === 0 ? "px-core" : "px-mobile",
        clientVisible: index % 5 !== 0,
        description: "Typed DAG task generated for NexusDAG planning and portfolio analysis.",
        plannedStart: plannedStart.toISOString(),
        plannedEnd: dueDate.toISOString(),
        actualStart: index % 3 === 0 ? new Date(plannedStart.getTime() + 4 * 60 * 60 * 1000).toISOString() : plannedStart.toISOString(),
        actualEnd,
        dueDate: dueDate.toISOString(),
        submittedAt: reviewStatus === "submitted" ? new Date(dueDate.getTime() + 3 * 60 * 60 * 1000).toISOString() : "",
        reviewStatus,
        delayReason: isDelayed ? this.getDelayReason(index) : "",
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

  private defaultTitle(role: UserRole): string {
    if (role === "client") return "Client Stakeholder";
    if (role === "employee") return "Project Contributor";
    return "Program Director";
  }

  private getTaskTitle(index: number): string {
    const names = ["Schema migration", "Risk model", "Client approval", "Execution monitor", "Release gate", "Incident drill"];
    return `${names[index % names.length]} ${index + 1}`;
  }

  private getStatus(index: number): TaskStatus {
    const statuses: TaskStatus[] = ["backlog", "ready", "in_progress", "blocked", "review", "done"];
    return statuses[index % statuses.length];
  }

  private getReviewStatus(index: number, status: TaskStatus): ReviewStatus {
    if (status === "review") return "submitted";
    if (status === "done") return index % 4 === 0 ? "changes_requested" : "approved";
    return "not_submitted";
  }

  private getDelayReason(index: number): string {
    const reasons = ["Dependency handoff slipped", "Waiting on review", "Capacity conflict", "Client clarification pending"];
    return reasons[index % reasons.length];
  }
}

export const projectRepository = new ProjectRepository();
