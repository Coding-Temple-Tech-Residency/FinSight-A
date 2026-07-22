import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AIInsight } from "../../types/AIInsight";
import { getPortfolioInsights } from "../../services/insightsAPI";

interface InsightsState {
    insight: AIInsight | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: InsightsState = {
    insight: null,
    status: 'idle',
    error: null
}

export const fetchPortfolioInsights = createAsyncThunk(
    'insights/fetchPortfolioInsights,',
    async (portfolioId: string) => {
        return await getPortfolioInsights(portfolioId);
    }
);

const insightsSlice = createSlice({
    name: 'insights',
    initialState, 
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPortfolioInsights.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })

            .addCase(fetchPortfolioInsights.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.insight = action.payload;
            })

            .addCase(fetchPortfolioInsights.rejected, (state, action) => {
                state.status = 'failed', 
                state.error = action.error.message ?? 'Failed to fetch insights';
            })
    }

})

export default insightsSlice.reducer