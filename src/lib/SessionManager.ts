import type { NexusUser } from "@/data/ProjectRepository";
import type { UserRole } from "@/domain/workflow/types";
export { SESSION_COOKIE } from "./SessionCookie";

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  provider: "google" | "password" | "developer";
  issuedAt: string;
}

export class SessionManager {
  public create(user: NexusUser, provider: AuthSession["provider"]): string {
    return Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      provider,
      issuedAt: new Date().toISOString(),
    } satisfies AuthSession)).toString("base64url");
  }

  public read(value?: string | null): AuthSession | null {
    if (!value) return null;
    try {
      const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSession;
      if (!parsed.userId || !parsed.email || !parsed.role) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}

export const sessionManager = new SessionManager();
