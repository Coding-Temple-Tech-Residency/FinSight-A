//FinSight-A/frontend/src/features/landing/landingSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LandingData } from "../../types/landing";

const API = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1`;

interface LandingState {
  data: LandingData | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: LandingState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchLanding = createAsyncThunk(
  "/fetch",
  async () => {
    const res = await fetch(`${API}/`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to load landing data");

    return (await res.json()) as LandingData;
  }
);

const landingSlice = createSlice({
  name: "landing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanding.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLanding.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchLanding.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unknown error";
      });
  },
});

export default landingSlice.reducer;