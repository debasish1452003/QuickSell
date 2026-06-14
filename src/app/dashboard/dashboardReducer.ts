"use client";

import type { DashboardPayload } from "@/data/DashboardService";
import type { SimulationReport, UserRole } from "@/domain/workflow/types";

export interface DashboardState {
  role: UserRole;
  graphSize: number;
  selectedNodeId: string;
  simulation: SimulationReport | null;
  payload: DashboardPayload | null;
  loading: boolean;
  error: string;
}

export type DashboardAction =
  | { type: "roleChanged"; role: UserRole }
  | { type: "graphSizeChanged"; graphSize: number }
  | { type: "nodeSelected"; nodeId: string }
  | { type: "dashboardLoading" }
  | { type: "dashboardLoaded"; payload: DashboardPayload }
  | { type: "dashboardFailed"; error: string }
  | { type: "simulationCompleted"; report: SimulationReport };

export const initialDashboardState: DashboardState = {
  role: "employer",
  graphSize: 180,
  selectedNodeId: "task-0001",
  simulation: null,
  payload: null,
  loading: true,
  error: "",
};

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case "roleChanged":
      return { ...state, role: action.role };
    case "graphSizeChanged":
      return { ...state, graphSize: action.graphSize };
    case "nodeSelected":
      return { ...state, selectedNodeId: action.nodeId };
    case "dashboardLoading":
      return { ...state, loading: true, error: "" };
    case "dashboardLoaded":
      return {
        ...state,
        role: action.payload.role,
        payload: action.payload,
        selectedNodeId: action.payload.nodes[0]?.id ?? "",
        loading: false,
        error: "",
      };
    case "dashboardFailed":
      return { ...state, loading: false, error: action.error };
    case "simulationCompleted":
      return { ...state, simulation: action.report };
    default:
      return state;
  }
}
