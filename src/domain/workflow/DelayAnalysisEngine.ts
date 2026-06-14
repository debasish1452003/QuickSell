import type { TaskNode } from "./TaskNode";
import type { DelayAnalysis } from "./types";

const HOUR_MS = 60 * 60 * 1000;

export class DelayAnalysisEngine {
  public analyze(tasks: TaskNode[], now = new Date("2026-06-14T12:00:00+05:30")): DelayAnalysis[] {
    return tasks.map((task) => this.analyzeTask(task, now));
  }

  public analyzeTask(task: TaskNode, now = new Date()): DelayAnalysis {
    const due = task.dueDate ? new Date(task.dueDate) : null;
    const completed = task.actualEnd ? new Date(task.actualEnd) : null;
    const reference = completed ?? now;
    const delayedByHours = due ? Math.max(0, Math.round((reference.getTime() - due.getTime()) / HOUR_MS)) : 0;
    const isBlocked = task.status === "blocked";
    const isReviewLate = task.status === "review" && delayedByHours > 0;
    const riskLevel = delayedByHours >= 48 || isBlocked ? "high" : delayedByHours >= 12 || isReviewLate ? "medium" : "low";

    return {
      taskId: task.id,
      delayedByHours,
      delayedByDays: Math.round((delayedByHours / 24) * 10) / 10,
      reason: task.delayReason || (delayedByHours > 0 ? "Past planned due date" : "On schedule"),
      riskLevel,
      isOverdue: delayedByHours > 0 && task.status !== "done",
    };
  }
}
