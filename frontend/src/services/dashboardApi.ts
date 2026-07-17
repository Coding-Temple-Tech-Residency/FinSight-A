// FinSight-A/frontend/src/services/dashboardApi.ts

import apiFetch from "./api";
import type { DashboardResponse } from "../types/dashboard";

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiFetch("/dashboard");
  return response.json();
}