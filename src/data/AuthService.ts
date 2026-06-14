import type { UserRole } from "@/domain/workflow/types";
import type { NexusUser, ProjectRepository } from "./ProjectRepository";
import { projectRepository } from "./ProjectRepository";

export class AuthService {
  public constructor(private readonly repository: ProjectRepository = projectRepository) {}

  public login(input: { email?: string; role?: UserRole }): NexusUser {
    if (input.email) {
      const found = this.repository.getUsers().find((user) => user.email.toLowerCase() === input.email?.toLowerCase());
      if (found) return found;
    }
    return this.repository.getUserByRole(input.role ?? "employer");
  }

  public signup(input: { name: string; email: string; role: UserRole; title?: string }): NexusUser {
    return this.repository.createUser(input);
  }

  public loginWithGoogle(input: { email: string; name: string; role: UserRole }): NexusUser {
    const found = this.repository.getUsers().find((user) => user.email.toLowerCase() === input.email.toLowerCase());
    if (found) return found;
    return this.repository.createUser({
      name: input.name,
      email: input.email,
      role: input.role,
      title: input.role === "employer" ? "Google Workspace Admin" : input.role === "client" ? "Client Approver" : "Delivery Assignee",
    });
  }

  public getSession(role: UserRole = "employer"): NexusUser {
    return this.repository.getUserByRole(role);
  }
}

export const authService = new AuthService();
