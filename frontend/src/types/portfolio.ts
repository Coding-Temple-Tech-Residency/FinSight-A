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
}