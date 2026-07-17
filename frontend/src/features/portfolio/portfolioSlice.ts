import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { type Holding, type PortfolioState, type PortfolioListResponse, HoldingListResponse, Portfolio, PortfolioCreate } from '../../types/portfolio';
import { getPortfolios, createHolding, editHolding, deleteHolding, getHoldings, createPortfolio, deletePortfolio } from '../../services/portfolioServices';


const initialState: PortfolioState = {
    portfolios: [],
    selectedPortfolio: null,
    holdings: [],
    portfolioStatus: 'idle',
    holdingStatus: 'idle',
    error: null,
};

export const fetchPortfolios = createAsyncThunk(
    'portfolio/fetchPortfolios',
    async () => {
        return await getPortfolios();
    }
);

export const fetchHoldings = createAsyncThunk<
    HoldingListResponse, string>
    (
    'portfolio/fetchHoldings',
    async (portfolioId) => {
        return await getHoldings(portfolioId);
    }
)

export const addHolding = createAsyncThunk<Holding, 
{
    portfolioId: string;
    holding: Omit<Holding, 'id'>

}>(
    'portfolio/addHolding',
    async ({portfolioId, holding}) => {
        return await createHolding(portfolioId, holding);
    }
);

export const updateHolding = createAsyncThunk<Holding, 

{
    portfolioId: string;
    holding: Holding
}>(
    'portfolio/updateHolding',
    async ({portfolioId, holding}) => {

        return await editHolding(portfolioId, holding);
    }
);

export const removeHolding = createAsyncThunk< string,
    {
        portfolioId: string;
        holdingId: string;
    }
>(
    'portfolio/removeHolding',
    async ({portfolioId, holdingId}) => {
        return await deleteHolding(portfolioId, holdingId);
    }
);

export const addPortfolio = createAsyncThunk<Portfolio, PortfolioCreate>(
    'portfolio/addPortfolio',
    async (portfolio) => {
        return await createPortfolio(portfolio);
    }
);

export const removePortfolio = createAsyncThunk<string, string>(
    'portfolio/removePortfolio', 
    async (id) => {
        return await deletePortfolio(id);
    }
)

const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    reducers: {
        setSelectedPortfolio(
            state,
            action: PayloadAction<Portfolio>
        ) {
            state.selectedPortfolio = 
                action.payload;
        }
    },

    extraReducers: (builder) => {

        builder

            .addCase(fetchPortfolios.pending, (state) => {
                state.status = 'loading';
            })

            .addCase(fetchPortfolios.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.portfolios = action.payload.portfolios;
            })

            .addCase(fetchPortfolios.rejected, (state, action) => {
                state.status = 'failed',
                state.error = action.error.message ?? 'Unknown error';
            })

            .addCase(addHolding.fulfilled, (state, action) => {
                state.holdings.push(action.payload);
            })

            .addCase(updateHolding.fulfilled, (state, action) => {
                const index = state.holdings.findIndex(
                    (holding) => holding.id === action.payload.id
                );

                if (index !== -1) {
                    state.holdings[index] = action.payload;
                }
            })

            .addCase(removeHolding.fulfilled, (state, action) => {
                state.holdings = state.holdings.filter(
                    (holding) => holding.id !== action.payload
                )
            })

            .addCase(fetchHoldings.pending, (state) => {
                state.status = 'loading';
            })

            .addCase(fetchHoldings.fulfilled, (state, action) => {
                state.status = 'succeeded';

                state.holdings = action.payload.holdings;
            })

            .addCase(fetchHoldings.rejected, (state, action) => {
                state.status = 'failed';

                state.error = 
                    action.error.message ?? 'Unkown error';
            })

            .addCase(addPortfolio.fulfilled, (state, action) => {

                console.log('Created portfolio:', action.payload)
                state.portfolios.push(action.payload);
            })

            .addCase(removePortfolio.fulfilled, (state, action) => {
                state.portfolios = state.portfolios.filter(
                    (portfolio) => 
                        portfolio.id !== action.payload
                );
                if ( 
                    state.selectedPortfolio?.id === action.payload
                ) {
                    state.selectedPortfolio = null;
                    state.holdings = []
                }
            })
    },
});

export default portfolioSlice.reducer;
export const { setSelectedPortfolio } = portfolioSlice.actions;
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
