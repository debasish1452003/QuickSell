export type UserRole = "employer" | "employee" | "client";

export type TaskStatus = "backlog" | "ready" | "in_progress" | "blocked" | "review" | "done";
export type ReviewStatus = "not_submitted" | "submitted" | "approved" | "changes_requested";
export type ProjectHealth = "on_track" | "risk" | "blocked";

export interface Vector3Position {
  x: number;
  y: number;
  z: number;
}

export interface TaskAssignee {
  id: string;
  name: string;
  role: UserRole;
  title: string;
}

export interface TaskNodeInput {
  id: string;
  title: string;
  durationHours: number;
  status: TaskStatus;
  priority: number;
  ownerId: string;
  projectId: string;
  position: Vector3Position;
  clientVisible?: boolean;
  description?: string;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  dueDate?: string;
  submittedAt?: string;
  reviewStatus?: ReviewStatus;
  delayReason?: string;
}

export interface DependencyEdgeInput {
  from: string;
  to: string;
  lagHours?: number;
  kind?: "finish_to_start" | "review_gate" | "release_gate";
}

export interface NodeSchedule {
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
}

export interface CriticalPathAnalysis {
  order: string[];
  projectDuration: number;
  criticalNodeIds: string[];
  criticalEdgeIds: string[];
  nodeSchedule: Map<string, NodeSchedule>;
}

export interface SimulationReport {
  iterations: number;
  conflictsResolved: number;
  cyclesRejected: number;
  criticalPathChanges: number;
  averageRecalculationMs: number;
  p95RecalculationMs: number;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  projectId: string;
  employeeId: string;
  submittedAt: string;
  status: Exclude<ReviewStatus, "not_submitted">;
  notes: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: "upcoming" | "complete" | "late";
}

export interface DelayAnalysis {
  taskId: string;
  delayedByHours: number;
  delayedByDays: number;
  reason: string;
  riskLevel: "low" | "medium" | "high";
  isOverdue: boolean;
}
