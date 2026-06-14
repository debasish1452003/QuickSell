"use client";

import { LogIn, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell/AppShell";
import type { UserRole } from "@/domain/workflow/types";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("employer");
  const [email, setEmail] = useState("employer@nexusdag.dev");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const result = await response.json();
    window.localStorage.setItem("nexusdag-role", result.user.role);
    window.localStorage.setItem("nexusdag-user", JSON.stringify(result.user));
    router.push("/dashboard");
  };

  return (
    <AppShell>
      <main className="auth-page">
        <section className="auth-card auth-card-wide">
          <div className="auth-copy">
            <p className="eyebrow">Google workspace access</p>
            <h1>Sign in to NexusDAG</h1>
            <p>
              Protected routing, role assignment, and client-safe views are handled from your authenticated session.
            </p>
            <div className="security-row">
              <span><ShieldCheck size={16} /> HttpOnly session cookie</span>
              <span>Role-aware authorization</span>
            </div>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Workspace role</span>
              <select
                value={role}
                suppressHydrationWarning
                onChange={(event) => {
                  const next = event.target.value as UserRole;
                  setRole(next);
                  setEmail(`${next}@nexusdag.dev`);
                }}
              >
                <option value="employer">Employer</option>
                <option value="employee">Employee assignee</option>
                <option value="client">Client approver</option>
              </select>
            </label>
            <a className="google-button" href={`/api/auth/google?role=${role}`}>
              <LogIn size={18} />
              Continue with Google
            </a>
            <div className="auth-divider"><span>Enterprise fallback</span></div>
            <label>
              <span>Verified email</span>
              <input value={email} suppressHydrationWarning onChange={(event) => setEmail(event.target.value)} />
            </label>
            <button type="submit" suppressHydrationWarning>Continue with assigned role</button>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
