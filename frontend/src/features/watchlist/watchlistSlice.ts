import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  added_at: string;
}

interface WatchlistState {
  items: WatchlistItem[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: WatchlistState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchWatchlist = createAsyncThunk("watchlist/fetch", async () => {
  const res = await fetch(`${API}/watchlist`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  const data = await res.json();
  return data.items as WatchlistItem[];
});

export const addToWatchlist = createAsyncThunk(
  "watchlist/add",
  async (symbol: string) => {
    const res = await fetch(`${API}/watchlist`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "Failed to add to watchlist");
    }
    return (await res.json()) as WatchlistItem;
  }
);

export const removeFromWatchlist = createAsyncThunk(
  "watchlist/remove",
  async (symbol: string) => {
    const res = await fetch(`${API}/watchlist/${symbol}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to remove from watchlist");
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
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.symbol !== action.payload);
      });
  },
});

export default watchlistSlice.reducer;
