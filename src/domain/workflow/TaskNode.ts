import type { ReviewStatus, TaskNodeInput, TaskStatus, Vector3Position } from "./types";

export class TaskNode {
  public readonly id: string;
  public readonly title: string;
  public readonly durationHours: number;
  public readonly status: TaskStatus;
  public readonly priority: number;
  public readonly ownerId: string;
  public readonly projectId: string;
  public readonly position: Vector3Position;
  public readonly clientVisible: boolean;
  public readonly description: string;
  public readonly plannedStart: string;
  public readonly plannedEnd: string;
  public readonly actualStart: string;
  public readonly actualEnd: string;
  public readonly dueDate: string;
  public readonly submittedAt: string;
  public readonly reviewStatus: ReviewStatus;
  public readonly delayReason: string;

  public constructor(input: TaskNodeInput) {
    this.id = input.id;
    this.title = input.title;
    this.durationHours = Math.max(1, Math.round(input.durationHours));
    this.status = input.status;
    this.priority = input.priority;
    this.ownerId = input.ownerId;
    this.projectId = input.projectId;
    this.position = { ...input.position };
    this.clientVisible = input.clientVisible ?? true;
    this.description = input.description ?? "";
    this.plannedStart = input.plannedStart ?? "";
    this.plannedEnd = input.plannedEnd ?? "";
    this.actualStart = input.actualStart ?? "";
    this.actualEnd = input.actualEnd ?? "";
    this.dueDate = input.dueDate ?? "";
    this.submittedAt = input.submittedAt ?? "";
    this.reviewStatus = input.reviewStatus ?? "not_submitted";
    this.delayReason = input.delayReason ?? "";
  }

  public withPatch(patch: Partial<TaskNodeInput>): TaskNode {
    return new TaskNode({
      id: this.id,
      title: this.title,
      durationHours: this.durationHours,
      status: this.status,
      priority: this.priority,
      ownerId: this.ownerId,
      projectId: this.projectId,
      position: this.position,
      clientVisible: this.clientVisible,
      description: this.description,
      plannedStart: this.plannedStart,
      plannedEnd: this.plannedEnd,
      actualStart: this.actualStart,
      actualEnd: this.actualEnd,
      dueDate: this.dueDate,
      submittedAt: this.submittedAt,
      reviewStatus: this.reviewStatus,
      delayReason: this.delayReason,
      ...patch,
    });
  }
}
