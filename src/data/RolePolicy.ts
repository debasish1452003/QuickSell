import type { TaskNode } from "@/domain/workflow/TaskNode";
import type { TaskSubmission, UserRole } from "@/domain/workflow/types";
import type { NexusProject, NexusUser } from "./ProjectRepository";

export class RolePolicy {
  public filterProjects(role: UserRole, user: NexusUser, projects: NexusProject[]): NexusProject[] {
    if (role === "client") return projects.filter((project) => project.clientUserId === user.id);
    if (role === "employee") return projects.filter((project) => project.employeeIds.includes(user.id));
    return projects;
  }

  public filterTasks(role: UserRole, user: NexusUser, tasks: TaskNode[]): TaskNode[] {
    if (role === "client") return tasks.filter((task) => task.clientVisible);
    if (role === "employee") return tasks.filter((task) => task.ownerId === user.id);
    return tasks;
  }

  public filterSubmissions(role: UserRole, user: NexusUser, submissions: TaskSubmission[]): TaskSubmission[] {
    if (role === "employee") return submissions.filter((submission) => submission.employeeId === user.id);
    if (role === "client") return submissions.filter((submission) => submission.status !== "changes_requested");
    return submissions;
  }

  public canSubmitForReview(role: UserRole): boolean {
    return role === "employee";
  }

  public canReviewSubmissions(role: UserRole): boolean {
    return role === "employer";
  }
}
