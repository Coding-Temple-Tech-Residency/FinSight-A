// FinSight-A/src/features/portfolio/portfolioSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PortfolioState } from "../../types/portfolio";
import { getPortfolio, getPortfolios, getQuote } from "../../services/portfolioApi";

const initialState: PortfolioState = {
  portfolio: null,
  quotes: {},
  status: "idle",
  error: null,
};

export const fetchPortfolio = createAsyncThunk(
  "portfolio/fetchPortfolio",
  async () => {
    const portfolios = await getPortfolios();

    if (portfolios.total === 0) {
      throw new Error("No portfolio found");
    }

    const portfolio = await getPortfolio(portfolios.portfolios[0].id);

    const quotes = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const quote = await getQuote(holding.symbol);

        return {
          symbol: holding.symbol,
          quote,
        };
      })
    );

    return {
      portfolio,
      quotes,
    };
  }
);
const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchPortfolio.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.status = "idle";

        state.portfolio = action.payload.portfolio;

        state.quotes = {};

        action.payload.quotes.forEach(({ symbol, quote }) => {
          state.quotes[symbol] = quote;
        });
      })

      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export default portfolioSlice.reducer;
