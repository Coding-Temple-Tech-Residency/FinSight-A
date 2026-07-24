export interface Stock {
  symbol: string;
  companyName?: string;
  price?: string;
  changeAmount?: string;
  changePercentage?: string;
  volume?: string;
}

export interface StockQuote {
  symbol: string;
  price?: string;
  change?: string;
  change_percent?: string;
  volume?: string;
  latestTradingDay?: string;
}

export interface TrendingStock {
  ticker: string;
  price?: string;
  changePercentage?: string;
  volume?: string;
}

export interface MarketTrends {
    top_gainers: TrendingStock[];
    top_losers: TrendingStock[];
}