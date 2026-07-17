// FinSight-A/src/types/portfolio.ts

import type { StockQuote } from "./stock";

export interface Holding {
  id: string;
  portfolio_id: string;
  symbol: string;
  quantity: number;
  avg_cost: number | null;
  added_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  holdings_count?: number;
  holdings: Holding[];
}

export interface PortfolioState {
  portfolio: Portfolio | null;
  quotes: Record<string, StockQuote>;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

export interface PortfolioListResponse {
  portfolios: Portfolio[];
  total: number;
}