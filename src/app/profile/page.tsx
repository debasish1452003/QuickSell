"use client";

import { BarChart3, BriefcaseBusiness, CheckCircle2, ClipboardList, FolderPlus, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell/AppShell";
import type { DashboardPayload } from "@/data/DashboardService";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [form, setForm] = useState({ name: "", client: "", releaseDate: "2026-10-01" });
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard", { cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/login?next=/profile";
      return;
    }
    const data = (await res.json()) as DashboardPayload;
    setPayload(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const stats = useMemo(() => {
    if (!payload) return [];
    return [
      ["Projects", String(payload.projects.length), BriefcaseBusiness],
      ["Assigned tasks", String(payload.nodes.length), ClipboardList],
      ["Reviews", String(payload.submissions.length), CheckCircle2],
      ["Stored progress", `${averageProgress(payload.workProgress)}%`, BarChart3],
    ];
  }, [payload]);

  const createProject = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMessage(response.ok ? "Project created and stored." : "Project could not be created.");
    if (response.ok) {
      setForm({ name: "", client: "", releaseDate: "2026-10-01" });
      await loadProfile();
    }
  };

  if (loading) {
    return (
      <AppShell>
        <main className="loading-state">Loading profile...</main>
      </AppShell>
    );
  }

  if (!payload) {
    return (
      <AppShell>
        <main className="loading-state">No profile found.</main>
      </AppShell>
    );
  }

  const { user, projects, submissions, milestones, nodes, workProgress } = payload;
  const roleCopy =
    user.role === "employer"
      ? "Create projects, assign delivery owners, and review submitted work."
      : user.role === "employee"
        ? "Track your assigned task stream and submit completed work for review."
        : "Monitor approved progress, milestones, and client-visible delivery status.";

  return (
    <AppShell user={user} projects={projects} submissions={submissions}>
      <main className="profile-dashboard">
        <section className="profile-hero panel">
          <div className="profile-avatar"><UserRound size={30} /></div>
          <div>
            <p className="eyebrow">Role profile</p>
            <h1>{user.name}</h1>
            <p>{roleCopy}</p>
          </div>
          <div className="profile-identity">
            <strong>{user.role}</strong>
            <span>{user.title}</span>
            <span>{user.email}</span>
          </div>
        </section>

        <section className="profile-stat-grid">
          {stats.map(([label, value, Icon]) => (
            <article className="metric" key={label as string}>
              <span>{label as string}</span>
              <strong>{value as string}</strong>
              <Icon size={18} />
            </article>
          ))}
        </section>

        <section className="profile-grid-layout">
          <article className="panel">
            <div className="panel-header">
              <h2>{user.role === "client" ? "Visible Projects" : "Managed Projects"}</h2>
              <span>{projects.length} active</span>
            </div>
            <div className="profile-list-panel">
              {projects.map((project) => (
                <div className="profile-row" key={project.id}>
                  <div>
                    <strong>{project.name}</strong>
                    <span>{project.client} - {project.health.replace("_", " ")}</span>
                  </div>
                  <em>{project.budgetUsed}% budget</em>
                </div>
              ))}
              {projects.length === 0 ? <p>No projects assigned yet.</p> : null}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>{user.role === "employee" ? "My Work Queue" : "Review Activity"}</h2>
              <span>{submissions.length} records</span>
            </div>
            <div className="profile-list-panel">
              {(user.role === "employee" ? nodes.slice(0, 6) : submissions.slice(0, 6)).map((item) => (
                "taskId" in item ? (
                  <div className="profile-row" key={item.id}>
                    <div>
                      <strong>{item.taskId}</strong>
                      <span>{item.notes}</span>
                    </div>
                    <em>{item.status.replace("_", " ")}</em>
                  </div>
                ) : (
                  <div className="profile-row" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.status.replace("_", " ")} - P{item.priority}</span>
                    </div>
                    <em>{item.reviewStatus.replace("_", " ")}</em>
                  </div>
                )
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Milestones</h2>
              <span>{milestones.length} tracked</span>
            </div>
            <div className="profile-list-panel">
              {milestones.slice(0, 6).map((milestone) => (
                <div className="profile-row" key={milestone.id}>
                  <div>
                    <strong>{milestone.title}</strong>
                    <span>{milestone.dueDate}</span>
                  </div>
                  <em>{milestone.status}</em>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h2>Stored Work Progress</h2>
              <span>{workProgress.length} records</span>
            </div>
            <div className="profile-list-panel">
              {workProgress.slice(0, 6).map((progress) => {
                const project = projects.find((item) => item.id === progress.projectId);
                return (
                  <div className="profile-row" key={progress.id}>
                    <div>
                      <strong>{project?.name ?? progress.projectId}</strong>
                      <span>{progress.phase} - {progress.notes}</span>
                    </div>
                    <em>{progress.percentComplete}%</em>
                  </div>
                );
              })}
              {workProgress.length === 0 ? <p>No progress records stored yet.</p> : null}
            </div>
          </article>

          {user.role === "employer" ? (
            <form className="panel profile-project-form" onSubmit={createProject}>
              <div className="panel-header">
                <h2>Create Project</h2>
                <FolderPlus size={18} />
              </div>
              <label>
                <span>Project name</span>
                <input
                  value={form.name}
                  suppressHydrationWarning
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </label>
              <label>
                <span>Client</span>
                <input
                  value={form.client}
                  suppressHydrationWarning
                  onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))}
                  required
                />
              </label>
              <label>
                <span>Release date</span>
                <input
                  type="date"
                  value={form.releaseDate}
                  suppressHydrationWarning
                  onChange={(event) => setForm((current) => ({ ...current, releaseDate: event.target.value }))}
                  required
                />
              </label>
              <button type="submit" suppressHydrationWarning>Store project</button>
              {message ? <p>{message}</p> : null}
            </form>
          ) : null}
        </section>
      </main>
    </AppShell>
  );
}

function averageProgress(progress: DashboardPayload["workProgress"]): number {
  if (progress.length === 0) return 0;
  return Math.round(progress.reduce((total, item) => total + item.percentComplete, 0) / progress.length);
}
