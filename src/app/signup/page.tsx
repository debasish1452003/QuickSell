"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell/AppShell";
import type { UserRole } from "@/domain/workflow/types";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("employee");
  const [name, setName] = useState("Demo Contributor");
  const [email, setEmail] = useState(`demo-${Date.now()}@nexusdag.dev`);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
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
          <p className="eyebrow">Create a demo profile</p>
          <h1>Sign up for NexusDAG</h1>
          <label>
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="employee">Employee</option>
              <option value="employer">Employer</option>
              <option value="client">Client</option>
            </select>
          </label>
          <button type="submit">Create and open dashboard</button>
        </form>
      </main>
    </AppShell>
  );
}
