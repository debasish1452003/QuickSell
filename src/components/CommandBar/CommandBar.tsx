import { Activity, LockKeyhole, Play, Workflow } from "lucide-react";
import type { NexusUser } from "@/data/ProjectRepository";
import type { UserRole } from "@/domain/workflow/types";
import "./CommandBar.css";

interface CommandBarProps {
  role: UserRole;
  user: NexusUser;
  graphSize: number;
  onRoleChange: (role: UserRole) => void;
  onGraphSizeChange: (size: number) => void;
  onRunSimulation: () => void;
}

export function CommandBar({ role, user, graphSize, onRoleChange, onGraphSizeChange, onRunSimulation }: CommandBarProps) {
  return (
    <header className="command-bar">
      <div className="brand-cluster">
        <div className="brand-mark"><Workflow size={24} /></div>
        <div>
          <h1>NexusDAG</h1>
          <p>Typed DAG planning, Kanban execution, and client progress visibility</p>
        </div>
      </div>

      <nav className="command-controls" aria-label="NexusDAG controls">
        <label>
          <span>Access role</span>
          <select value={role} onChange={(event) => onRoleChange(event.target.value as UserRole)}>
            <option value="employer">Employer</option>
            <option value="employee">Employee</option>
            <option value="client">Client</option>
          </select>
        </label>
        <label>
          <span>Graph scale</span>
          <select value={graphSize} onChange={(event) => onGraphSizeChange(Number(event.target.value))}>
            {[90, 180, 500, 1200].map((size) => <option key={size} value={size}>{size} tasks</option>)}
          </select>
        </label>
        <button type="button" onClick={onRunSimulation}>
          <Play size={16} />
          Stress Test
        </button>
        <div className="session-pill">
          <LockKeyhole size={15} />
          <span>{user.name}</span>
          <strong>{user.role}</strong>
        </div>
        <div className="live-pill"><Activity size={15} /> API backed</div>
      </nav>
    </header>
  );
}
