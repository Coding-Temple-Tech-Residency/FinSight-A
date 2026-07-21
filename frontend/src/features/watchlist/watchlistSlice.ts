import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiFetch from "../../services/api";
import type { StockQuote } from "../../types/stock";

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  added_at: string;
}

interface WatchlistState {
  items: WatchlistItem[];
  quotes: Record<string, StockQuote>;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: WatchlistState = {
  items: [],
  quotes: {},
  status: "idle",
  error: null,
};

export const fetchWatchlist = createAsyncThunk(
  "watchlist/fetch",
  async () => {
    const response = await apiFetch("/watchlist");
    const data = await response.json();

    return data.items as WatchlistItem[];
  }
);

export const fetchWatchlistQuotes = createAsyncThunk(
  "watchlist/fetchQuotes",
  async (items: WatchlistItem[]) => {
    const results = await Promise.all(
      items.map(async (item) => {
        const response = await apiFetch(
          `/market/quote/${item.symbol.toUpperCase()}`
        );

        const quote = (await response.json()) as StockQuote;

        return {
          symbol: item.symbol,
          quote,
        };
      })
    );

    return results.reduce(
      (acc, item) => {
        acc[item.symbol] = item.quote;
        return acc;
      },
      {} as Record<string, StockQuote>
    );
  }
);

export const addToWatchlist = createAsyncThunk(
  "watchlist/add",
  async (symbol: string) => {
    const response = await apiFetch("/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail ?? "Failed to add to watchlist");
    }

    return data as WatchlistItem;
  }
);

export const removeFromWatchlist = createAsyncThunk(
  "watchlist/remove",
  async (symbol: string) => {
    await apiFetch(`/watchlist/${symbol}`, {
      method: "DELETE",
    });

    return symbol;
  }
);

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })

      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      })

      .addCase(fetchWatchlistQuotes.fulfilled, (state, action) => {
        state.quotes = action.payload;
      })

      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.symbol !== action.payload
        );

        delete state.quotes[action.payload];
      });
  },
});

export default watchlistSlice.reducer;