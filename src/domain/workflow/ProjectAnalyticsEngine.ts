import type { NexusProject } from "@/data/ProjectRepository";
import { DelayAnalysisEngine } from "./DelayAnalysisEngine";
import type { TaskNode } from "./TaskNode";
import type { DelayAnalysis, ProjectHealth, TaskSubmission } from "./types";

export interface ProjectAnalytics {
  completionRate: number;
  blockedTasks: number;
  delayedTasks: number;
  overdueHours: number;
  reviewQueue: number;
  health: ProjectHealth;
  delayAnalyses: DelayAnalysis[];
}

export interface PortfolioAnalytics extends ProjectAnalytics {
  projectCount: number;
  totalTasks: number;
  employeeLoad: Array<{ employeeId: string; taskCount: number; delayedCount: number }>;
}

export class ProjectAnalyticsEngine {
  private readonly delayEngine = new DelayAnalysisEngine();

  public analyzeProject(project: NexusProject, tasks: TaskNode[], submissions: TaskSubmission[]): ProjectAnalytics {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const delayAnalyses = this.delayEngine.analyze(projectTasks);
    const done = projectTasks.filter((task) => task.status === "done").length;
    const blockedTasks = projectTasks.filter((task) => task.status === "blocked").length;
    const delayedTasks = delayAnalyses.filter((delay) => delay.isOverdue).length;
    const overdueHours = delayAnalyses.reduce((total, delay) => total + delay.delayedByHours, 0);
    const reviewQueue = submissions.filter((submission) => submission.projectId === project.id && submission.status === "submitted").length;
    const completionRate = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
    const health: ProjectHealth = blockedTasks > 3 || delayedTasks > 8 ? "blocked" : delayedTasks > 2 || reviewQueue > 4 ? "risk" : "on_track";

    return { completionRate, blockedTasks, delayedTasks, overdueHours, reviewQueue, health, delayAnalyses };
  }

  public analyzePortfolio(projects: NexusProject[], tasks: TaskNode[], submissions: TaskSubmission[]): PortfolioAnalytics {
    const delayAnalyses = this.delayEngine.analyze(tasks);
    const done = tasks.filter((task) => task.status === "done").length;
    const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
    const delayedTasks = delayAnalyses.filter((delay) => delay.isOverdue).length;
    const overdueHours = delayAnalyses.reduce((total, delay) => total + delay.delayedByHours, 0);
    const reviewQueue = submissions.filter((submission) => submission.status === "submitted").length;
    const completionRate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    const employeeLoad = Array.from(new Set(tasks.map((task) => task.ownerId))).map((employeeId) => ({
      employeeId,
      taskCount: tasks.filter((task) => task.ownerId === employeeId).length,
      delayedCount: delayAnalyses.filter((delay) => {
        const task = tasks.find((candidate) => candidate.id === delay.taskId);
        return task?.ownerId === employeeId && delay.isOverdue;
      }).length,
    }));
    const health: ProjectHealth = blockedTasks > 5 || delayedTasks > 12 ? "blocked" : delayedTasks > 4 || reviewQueue > 5 ? "risk" : "on_track";

    return {
      completionRate,
      blockedTasks,
      delayedTasks,
      overdueHours,
      reviewQueue,
      health,
      delayAnalyses,
      projectCount: projects.length,
      totalTasks: tasks.length,
      employeeLoad,
    };
  }
}
