import { dashboardController } from "@/controllers/DashboardController";

export function GET(request: Request) {
  return dashboardController.getDashboard(request);
}
