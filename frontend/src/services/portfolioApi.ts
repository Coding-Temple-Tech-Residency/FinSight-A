// FinSight-A/src/services/portfolioApi.ts

import apiFetch from "./api";
import type {
  Portfolio,
  PortfolioListResponse,
  PortfolioPerformanceResponse, PerformanceRange
} from "../types/portfolio";
import { StockQuote } from "../types/stock";

export async function getPortfolios(): Promise<PortfolioListResponse> {
  const response = await apiFetch("/portfolios");
  return response.json();
}

export async function getPortfolio(
  portfolioId: string
): Promise<Portfolio> {
  const response = await apiFetch(`/portfolios/${portfolioId}`);
  return response.json();
}

export async function getPortfolioPerformance(
  portfolioId: string,
  range: PerformanceRange
): Promise<PortfolioPerformanceResponse> {
  const response = await apiFetch(
    `/portfolios/${portfolioId}/performance?range=${range}`
  );
  return response.json();
}

export async function getQuote(
  symbol: string
): Promise<StockQuote> {
  const response = await apiFetch(`/market/quote/${symbol.toUpperCase()}`);
  return response.json();
}