import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

export interface MoverItem {
  ticker: string;
  price?: string;
  change_amount?: string;
  change_percentage?: string;
  volume?: string;
}

export interface TopMovers {
  top_gainers: MoverItem[];
  top_losers: MoverItem[];
}

export interface Quote {
  symbol: string;
  price?: string;
  change?: string;
  change_percent?: string;
  volume?: string;
  latest_trading_day?: string;
}

interface MarketState {
  trends: TopMovers | null;
  quote: Quote | null;
  status: "idle" | "loading" | "failed";
  quoteStatus: "idle" | "loading" | "failed";
  error: string | null;
  quoteError: string | null;
}

const initialState: MarketState = {
  trends: null,
  quote: null,
  status: "idle",
  quoteStatus: "idle",
  error: null,
  quoteError: null,
};

export const fetchTrends = createAsyncThunk("market/fetchTrends", async () => {
  const res = await fetch(`${API}/market/trends`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch market trends");
  return (await res.json()) as TopMovers;
});

export const fetchQuote = createAsyncThunk(
  "market/fetchQuote",
  async (symbol: string) => {
    const res = await fetch(`${API}/market/quote/${symbol.toUpperCase()}`, {
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "Quote unavailable");
    }
    return (await res.json()) as Quote;
  }
);

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    clearQuote(state) {
      state.quote = null;
      state.quoteError = null;
      state.quoteStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrends.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.status = "idle";
        state.trends = action.payload;
      })
      .addCase(fetchTrends.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      })
      .addCase(fetchQuote.pending, (state) => {
        state.quoteStatus = "loading";
        state.quoteError = null;
        state.quote = null;
      })
      .addCase(fetchQuote.fulfilled, (state, action) => {
        state.quoteStatus = "idle";
        state.quote = action.payload;
      })
      .addCase(fetchQuote.rejected, (state, action) => {
        state.quoteStatus = "failed";
        state.quoteError = action.error.message ?? "Unknown error";
      });
  },
});

export const { clearQuote } = marketSlice.actions;
export default marketSlice.reducer;
