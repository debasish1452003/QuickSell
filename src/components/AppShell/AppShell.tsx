"use client";

import { BarChart3, ChevronDown, LogIn, Sparkles, UserRound, Workflow } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { NexusProject, NexusUser } from "@/data/ProjectRepository";
import type { TaskSubmission } from "@/domain/workflow/types";
import "./AppShell.css";

export function AppShell({
  user,
  projects = [],
  submissions = [],
  children,
}: {
  user?: NexusUser;
  projects?: NexusProject[];
  submissions?: TaskSubmission[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="nav-brand" href="/">
          <span><Workflow size={22} /></span>
          <strong>NexusDAG</strong>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Login</Link>
          <Link className="nav-cta" href="/signup">Sign up</Link>
        </nav>
        <div className="profile-wrap">
          {user ? (
            <button className="profile-button" type="button" onClick={() => setOpen((value) => !value)}>
              <UserRound size={17} />
              <span>{user.name}</span>
              <ChevronDown size={15} />
            </button>
          ) : (
            <Link className="profile-button" href="/login">
              <LogIn size={17} />
              <span>Demo login</span>
            </Link>
          )}
          {user && open ? (
            <section className="profile-menu" aria-label="Profile details">
              <div className="profile-head">
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.title}</span>
                </div>
                <em>{user.role}</em>
              </div>
              <div className="profile-grid">
                <p><Sparkles size={14} /> {projects.length} active projects</p>
                <p><BarChart3 size={14} /> {submissions.length} review records</p>
              </div>
              <div className="profile-list">
                <span>Recent reviews</span>
                {submissions.slice(0, 3).map((submission) => (
                  <p key={submission.id}>{submission.taskId} - {submission.status.replace("_", " ")}</p>
                ))}
                {submissions.length === 0 ? <p>No submissions yet</p> : null}
              </div>
            </section>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
