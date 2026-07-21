import type { StockQuote } from "./stock";

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

export type Status = | 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PortfolioState {
    portfolios: Portfolio[];
    selectedPortfolio: Portfolio | null;
    holdings: Holding[];
    transactions: Transaction[];
    quotes: Record<string, StockQuote>;
    portfolio: Portfolio | null; //potentially delete and replace where it is being called with selectedPortfolio
    
    portfolioStatus: Status;
    holdingStatus: Status
    transactionStatus: Status
    quoteStatus: Status
    error: string | null;
}
// export interface PortfolioState {
//   
//   
//   
//   error: string | null;
// }

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
}

export interface Transaction {
    id: string;
    portfolio_id: string;
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price_at_trade: number | null;
    traded_at: string;
}

export interface TransactionCreate {
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price_at_trade: number | null;
}

export interface PortfolioDashboardResponse {
    portfolio: Portfolio;
    holdings: Holding [];
    quotes: Record<string, StockQuote>;
}

// FinSight-A/src/types/portfolio.ts



// export interface Holding {
//   id: string;
//   portfolio_id: string;
//   symbol: string;
//   quantity: number;
//   avg_cost: number | null;
//   added_at: string;
//   updated_at: string;
// }

// export interface Portfolio {
//   id: string;
//   user_id: string;
//   name: string;
//   description: string | null;
//   created_at: string;
//   updated_at: string;
//   holdings_count?: number;
//   holdings: Holding[];
// }


// export interface PortfolioListResponse {
//   portfolios: Portfolio[];
//   total: number;
// }