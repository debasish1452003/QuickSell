"use client";

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
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow">Demo access</p>
          <h1>Login to NexusDAG</h1>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Role</span>
            <select
              value={role}
              onChange={(event) => {
                const next = event.target.value as UserRole;
                setRole(next);
                setEmail(`${next}@nexusdag.dev`);
              }}
            >
              <option value="employer">Employer</option>
              <option value="employee">Employee</option>
              <option value="client">Client</option>
            </select>
          </label>
          <button type="submit">Enter dashboard</button>
        </form>
      </main>
    </AppShell>
  );
}
