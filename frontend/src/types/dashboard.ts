// FinSight-A/src/types/dashboard.ts

export interface DashboardState {
  data: DashboardResponse | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface DashboardResponse {
  user_profile: {
    id: string;
    email: string;
    username: string;
  };

  portfolio_summary: {
    count: number;
    total_value: number;
    today_change: number;
    today_change_percent: number;
    total_return: number;
    total_return_percent: number;
    cash_available: number;
    best_performer: string;
  };

  performance: {
    date: string;
    portfolio: number;
    benchmark: number;
  }[];

  watchlist_preview: any[];
  recent_market_trends: any[];
}
