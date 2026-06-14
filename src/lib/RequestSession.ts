import type { AuthSession } from "./SessionManager";
import { SESSION_COOKIE, sessionManager } from "./SessionManager";

export function getRequestSession(request: Request): AuthSession | null {
  const cookie = request.headers.get("cookie") ?? "";
  const value = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")[1];

  return sessionManager.read(value ?? null);
}
