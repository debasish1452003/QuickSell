"use client";

import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell/AppShell";
import type { UserRole } from "@/domain/workflow/types";

export default function SignupPage() {
  const [role, setRole] = useState<UserRole>("employee");

  return (
    <AppShell>
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-icon"><UserPlus size={22} /></div>
          <p className="eyebrow">Workspace onboarding</p>
          <h1>Create access</h1>
          <p className="auth-note">New members join through Google and receive a workspace role assignment.</p>
          <label>
            <span>Requested role</span>
          <select value={role} suppressHydrationWarning onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="employee">Employee assignee</option>
            <option value="employer">Employer</option>
            <option value="client">Client approver</option>
            </select>
          </label>
          <a className="google-button" href={`/api/auth/google?role=${role}`}>
            <LogIn size={18} />
            Continue with Google
          </a>
        </section>
      </main>
    </AppShell>
  );
}
