export type UserRole = "admin" | "member" | "client";

export type TaskStatus = "backlog" | "ready" | "in_progress" | "blocked" | "review" | "done";

export interface Vector3Position {
  x: number;
  y: number;
  z: number;
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
