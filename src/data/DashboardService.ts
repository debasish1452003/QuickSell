import { CriticalPathEngine } from "@/domain/workflow/CriticalPathEngine";
import { ProjectAnalyticsEngine, type PortfolioAnalytics } from "@/domain/workflow/ProjectAnalyticsEngine";
import type { CriticalPathAnalysis, ProjectMilestone, TaskSubmission, UserRole } from "@/domain/workflow/types";
import type { DependencyEdge } from "@/domain/workflow/DependencyEdge";
import type { TaskNode } from "@/domain/workflow/TaskNode";
import { projectRepository, type NexusProject, type NexusUser } from "./ProjectRepository";
import type { ProjectRepository } from "./ProjectRepository";
import { RolePolicy } from "./RolePolicy";

export interface SerializedAnalysis extends Omit<CriticalPathAnalysis, "nodeSchedule"> {
  nodeSchedule: Record<string, CriticalPathAnalysis["nodeSchedule"] extends Map<string, infer T> ? T : never>;
}

export interface DashboardPayload {
  user: NexusUser;
  role: UserRole;
  users: NexusUser[];
  projects: NexusProject[];
  milestones: ProjectMilestone[];
  submissions: TaskSubmission[];
  nodes: TaskNode[];
  edges: DependencyEdge[];
  analysis: SerializedAnalysis;
  analytics: PortfolioAnalytics;
  permissions: {
    canSubmitForReview: boolean;
    canReviewSubmissions: boolean;
  };
}

export class DashboardService {
  private readonly policy = new RolePolicy();
  private readonly analytics = new ProjectAnalyticsEngine();

  public constructor(private readonly repository: ProjectRepository = projectRepository) {}

  public getDashboard(role: UserRole = "employer", size = 180): DashboardPayload {
    const user = this.repository.getUserByRole(role);
    const graph = this.repository.createWorkflowGraph(size);
    const projects = this.policy.filterProjects(role, user, this.repository.getProjects());
    const projectIds = new Set(projects.map((project) => project.id));
    const roleTasks = this.policy.filterTasks(role, user, graph.getNodes()).filter((task) => projectIds.has(task.projectId));
    const roleTaskIds = new Set(roleTasks.map((task) => task.id));
    const roleSubmissions = this.policy
      .filterSubmissions(role, user, this.repository.getSubmissions())
      .filter((submission) => projectIds.has(submission.projectId));
    const roleGraph = this.repository.createWorkflowGraph(size);
    roleGraph.getNodes().forEach((node) => {
      if (!roleTaskIds.has(node.id)) {
        roleGraph.removeNode(node.id);
      }
    });
    const analysis = new CriticalPathEngine().analyze(roleGraph);

    return {
      user,
      role,
      users: this.repository.getUsers(),
      projects,
      milestones: this.repository.getMilestones().filter((milestone) => projectIds.has(milestone.projectId)),
      submissions: roleSubmissions,
      nodes: roleGraph.getNodes(),
      edges: roleGraph.getEdges(),
      analysis: {
        order: analysis.order,
        projectDuration: analysis.projectDuration,
        criticalNodeIds: analysis.criticalNodeIds,
        criticalEdgeIds: analysis.criticalEdgeIds,
        nodeSchedule: Object.fromEntries(analysis.nodeSchedule),
      },
      analytics: this.analytics.analyzePortfolio(projects, roleTasks, roleSubmissions),
      permissions: {
        canSubmitForReview: this.policy.canSubmitForReview(role),
        canReviewSubmissions: this.policy.canReviewSubmissions(role),
      },
    };
  }
}

export const dashboardService = new DashboardService();
