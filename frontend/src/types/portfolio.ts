export interface Holding {
    id: string;
    //portfolio_id: string,
    symbol: string,
    //companyName: string;
    quantity: number;
    avg_cost: number;
    //currentPrice?: number;
    //purchasDate?: string;
    //notes?: string;
}

export interface Portfolio {
    id: string;
    name: string;
    description?: string;
    holdings_count: number;
}

export interface PortfolioState {
    portfolios: Portfolio[];
    selectedPortfolio: Portfolio | null;
    holdings: Holding[];

    portfolioStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    holdingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

export interface PortfolioListResponse {
    portfolios: Portfolio[];
    total: number;
}

export interface HoldingListResponse {
    holdings: Holding[];
    total: number;
}

export interface PortfolioCreate {
    name: string;
    description?: string;
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