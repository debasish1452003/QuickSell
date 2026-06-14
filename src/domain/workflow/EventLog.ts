export interface WorkflowEvent {
  id: string;
  at: string;
  actorId: string;
  type: "task_updated" | "dependency_added" | "dependency_rejected" | "simulation_conflict";
  message: string;
}

export class EventLog {
  private readonly events: WorkflowEvent[] = [];

  public record(event: Omit<WorkflowEvent, "id" | "at">): WorkflowEvent {
    const next = {
      ...event,
      id: `evt-${this.events.length + 1}`,
      at: new Date().toISOString(),
    };
    this.events.unshift(next);
    return next;
  }

  public list(): WorkflowEvent[] {
    return [...this.events];
  }
}
