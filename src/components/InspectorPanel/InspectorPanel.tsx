"use client";

import { useState } from "react";
import { Metric } from "@/components/Shared/Metric";
import type { NexusUser } from "@/data/ProjectRepository";
import type { TaskNode } from "@/domain/workflow/TaskNode";
import type { DelayAnalysis, NodeSchedule, UserRole } from "@/domain/workflow/types";
import "./InspectorPanel.css";

export function InspectorPanel({
  node,
  schedule,
  role,
  users,
  delay,
  permissions,
  currentUser,
}: {
  node?: TaskNode;
  schedule?: NodeSchedule;
  role: UserRole;
  users: NexusUser[];
  delay?: DelayAnalysis;
  permissions: { canSubmitForReview: boolean; canReviewSubmissions: boolean };
  currentUser: NexusUser;
}) {
  const [message, setMessage] = useState("");

  const submitForReview = async () => {
    if (!node) return;
    const response = await fetch("/api/tasks/submit-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: node.id, employeeId: currentUser.id, notes: "Submitted from task inspector." }),
    });
    setMessage(response.ok ? "Submitted for employer review." : "Unable to submit this task.");
  };

  return (
    <article className="panel inspector">
      <div className="panel-header">
        <h2>Task Inspector</h2>
        <span>{role === "client" ? "Read only" : permissions.canSubmitForReview ? "Submit enabled" : "Review enabled"}</span>
      </div>
      {node ? (
        <div className="panel-body">
          <p className="eyebrow">{node.id}</p>
          <h3>{node.title}</h3>
          <p className="description">{node.description}</p>
          <div className="metric-grid">
            <Metric label="Owner" value={users.find((user) => user.id === node.ownerId)?.name ?? "Unassigned"} />
            <Metric label="Duration" value={`${node.durationHours}h`} />
            <Metric label="Status" value={node.status.replace("_", " ")} />
            <Metric label="Review" value={node.reviewStatus.replace("_", " ")} />
            <Metric label="Due" value={formatDate(node.dueDate)} />
            <Metric label="Delayed by" value={`${delay?.delayedByHours ?? 0}h`} />
            <Metric label="Slack" value={`${schedule?.slack ?? 0}h`} />
            <Metric label="Critical" value={schedule?.isCritical ? "Yes" : "No"} />
          </div>
          {delay?.isOverdue ? <p className="delay-note">Delay reason: {delay.reason}</p> : null}
          {permissions.canSubmitForReview && node.ownerId === currentUser.id ? (
            <button className="inspector-action" type="button" onClick={submitForReview}>Submit for review</button>
          ) : null}
          {permissions.canReviewSubmissions ? <p className="review-note">Employer view can approve or request changes from the review queue.</p> : null}
          {message ? <p className="review-note">{message}</p> : null}
        </div>
      ) : (
        <div className="panel-body">Select a task to inspect its schedule.</div>
      )}
    </article>
  );
}

function formatDate(value: string): string {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
