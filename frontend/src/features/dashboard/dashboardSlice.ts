// FinSight-A/src/features/dashboard/dashboardSlice.ts

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDashboard } from "../../services/dashboardApi";
import type {
  DashboardResponse,
  DashboardState,
} from "../../types/dashboard";

const initialState: DashboardState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchDashboard = createAsyncThunk<
  DashboardResponse,
  void,
  { rejectValue: string }
>(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      return await getDashboard();
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue("Failed to fetch dashboard.");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })

      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Something went wrong.";
      });
  },
});

export default dashboardSlice.reducer;

