import { authService } from "@/data/AuthService";
import type { UserRole } from "@/domain/workflow/types";
import { appUrl } from "@/lib/AppUrl";
import { SESSION_COOKIE, sessionManager } from "@/lib/SessionManager";
import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_PROFILE_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
}

export class AuthController {
  public async login(request: Request): Promise<NextResponse> {
    const body = await request.json().catch(() => ({}));
    const user = authService.login({ email: body.email, role: body.role as UserRole | undefined });
    return this.withSession(NextResponse.json({ user }), user, "password");
  }

  public signupRedirect(request: Request): NextResponse {
    const url = appUrl("/login", request);
    url.searchParams.set("mode", "signup");
    return NextResponse.redirect(url);
  }

  public startGoogle(request: Request): NextResponse {
    const url = new URL(request.url);
    const role = (url.searchParams.get("role") ?? "employee") as UserRole;
    const callback = appUrl("/api/auth/google/callback", request);

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      callback.searchParams.set("dev", "1");
      callback.searchParams.set("role", role);
      return NextResponse.redirect(callback);
    }

    const state = Buffer.from(JSON.stringify({ role, nonce: crypto.randomUUID() })).toString("base64url");
    const google = new URL(GOOGLE_AUTH_URL);
    google.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
    google.searchParams.set("redirect_uri", callback.toString());
    google.searchParams.set("response_type", "code");
    google.searchParams.set("scope", "openid email profile");
    google.searchParams.set("prompt", "select_account");
    google.searchParams.set("state", state);
    return NextResponse.redirect(google);
  }

  public async finishGoogle(request: Request): Promise<NextResponse> {
    const url = new URL(request.url);
    const role = this.readRole(url.searchParams.get("state")) ?? (url.searchParams.get("role") as UserRole | null) ?? "employee";
    const profile = url.searchParams.get("dev") === "1"
      ? this.developerProfile(role)
      : await this.exchangeGoogleCode(request, url.searchParams.get("code"));

    const user = authService.loginWithGoogle({ ...profile, role });
    const response = NextResponse.redirect(appUrl("/dashboard", request));
    return this.withSession(response, user, url.searchParams.get("dev") === "1" ? "developer" : "google");
  }

  public logout(request: Request): NextResponse {
    const response = NextResponse.redirect(appUrl("/login", request), 303);
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  private withSession(response: NextResponse, user: ReturnType<typeof authService.login>, provider: "google" | "password" | "developer"): NextResponse {
    response.cookies.set(SESSION_COOKIE, sessionManager.create(user, provider), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return response;
  }

  private readRole(state: string | null): UserRole | null {
    if (!state) return null;
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as { role?: UserRole };
      return parsed.role ?? null;
    } catch {
      return null;
    }
  }

  private developerProfile(role: UserRole): GoogleProfile {
    return {
      email: `${role}.google@nexusdag.dev`,
      name: role === "employer" ? "Google Program Lead" : role === "client" ? "Google Client Partner" : "Google Delivery Assignee",
    };
  }

  private async exchangeGoogleCode(request: Request, code: string | null): Promise<GoogleProfile> {
    if (!code) throw new Error("Google OAuth code was not supplied.");
    const redirectUri = appUrl("/api/auth/google/callback", request).toString();
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const token = await tokenResponse.json();
    const profileResponse = await fetch(GOOGLE_PROFILE_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    return profileResponse.json();
  }
}

export const authController = new AuthController();
