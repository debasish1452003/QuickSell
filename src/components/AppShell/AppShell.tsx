"use client";

import { BarChart3, ChevronDown, LogIn, LogOut, Menu, Sparkles, UserRound, Workflow, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    ...(user ? [{ href: "/profile", label: "Profile" }] : []),
  ];

  const clearLocalSession = () => {
    window.localStorage.removeItem("nexusdag-role");
    window.localStorage.removeItem("nexusdag-user");
  };

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="nav-brand" href="/">
          <span><Workflow size={22} /></span>
          <strong>NexusDAG</strong>
        </Link>
        <button className="nav-toggle" type="button" onClick={() => setNavOpen((value) => !value)} aria-label="Toggle navigation">
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={navOpen ? "is-open" : ""} aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              className={pathname === link.href ? "active" : ""}
              href={link.href}
              onClick={() => setNavOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user ? <Link href="/login" onClick={() => setNavOpen(false)}>Login</Link> : null}
        </nav>
        <div className="profile-wrap">
          {user ? (
            <button className="profile-button" type="button" onClick={() => setOpen((value) => !value)}>
              <UserRound size={17} />
              <span>{user.name}</span>
              <ChevronDown size={15} />
            </button>
          ) : null}
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
              <form action="/api/auth/logout" method="post" onSubmit={clearLocalSession}>
                <button className="logout-link logout-button" type="submit">
                  <LogOut size={14} /> Sign out
                </button>
              </form>
            </section>
          ) : null}
          {!user ? (
            <Link className="profile-button" href="/login">
              <LogIn size={17} />
              <span>Google sign in</span>
            </Link>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
