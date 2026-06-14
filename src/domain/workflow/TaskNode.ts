import type { TaskNodeInput, TaskStatus, Vector3Position } from "./types";

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
      ...patch,
    });
  }
}
