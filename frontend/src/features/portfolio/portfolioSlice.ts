import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { type Holding, type PortfolioState, type PortfolioListResponse, HoldingListResponse, Portfolio, PortfolioCreate, type Transaction, PortfolioDashboardResponse, TransactionCreate } from '../../types/portfolio';
import { getPortfolios, createHolding, editHolding, deleteHolding, getHoldings, createPortfolio, deletePortfolio, getTransactions, createTransaction } from '../../services/portfolioServices';
import { getPortfolio, getQuote } from "../../services/portfolioApi";
import { StockQuote } from '../../types/stock';

const initialState: PortfolioState = {
    portfolios: [],
    selectedPortfolio: null,
    holdings: [],
    transactions: [],

    portfolio: null,
    quotes: {},

    portfolioStatus: 'idle',
    holdingStatus: 'idle',
    transactionStatus: 'idle',
    quoteStatus: 'idle',
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

//Transactions

export const fetchTransactions = createAsyncThunk<Transaction[], string>(
    'portfolio/fetchTransactions',
    async (portfolioId) => {
        return await getTransactions(portfolioId);
    }
);

export const addTransaction = createAsyncThunk<Transaction, {
    portfolioId: string;
    transaction: TransactionCreate;
    
}
>
(
    'portfolio/addTransaction',
    async({
        portfolioId,
        transaction
    }) => {
        return await createTransaction(
            portfolioId,
            transaction
        );
    }
);

//Dashboard
export const fetchPortfolio = createAsyncThunk
<PortfolioDashboardResponse, string>(
  "portfolio/fetchPortfolio",
  async (portfolioId) => {
    const portfolio = await getPortfolio(portfolioId);
    const holdingsResponse = await getHoldings(portfolioId);
    // if (portfolio.total === 0) {
    //   throw new Error("No portfolio found");
    // }

    //const portfolio = await getPortfolio(portfolios.portfolios[0].id);
    const holdings = holdingsResponse.holdings;

    const quoteResults = await Promise.all(
        holdings.map(async (holding) => {
            const quote = await getQuote(holding.symbol);
            return {
                symbol: holding.symbol,
                quote
            }
        })
    )
    const quotes = await quoteResults.reduce(
      (acc, item) => {
        acc[item.symbol] = item.quote;
        return acc;
      },
      {} as Record<string, StockQuote>
    );

    return {
      portfolio,
      holdings,
      quotes,
    };
  }
);

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
            //Portfolio
            .addCase(fetchPortfolios.pending, (state) => {
                state.portfolioStatus = 'loading';
            })

            .addCase(fetchPortfolios.fulfilled, (state, action) => {
                state.portfolioStatus = 'succeeded';
                state.portfolios = action.payload.portfolios;
            })

            .addCase(fetchPortfolios.rejected, (state, action) => {
                state.portfolioStatus = 'failed',
                state.error = action.error.message ?? 'Unknown error';
            })
            //Holdings
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
                state.holdingStatus = 'loading';
            })

            .addCase(fetchHoldings.fulfilled, (state, action) => {
                state.holdingStatus = 'succeeded';

                state.holdings = action.payload.holdings;
            })

            .addCase(fetchHoldings.rejected, (state, action) => {
                state.holdingStatus = 'failed';

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

            //Transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.transactionStatus = 'loading';
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.transactionStatus = 'succeeded';
                state.transactions = action.payload
            })
            .addCase(fetchTransactions.rejected, (state,action) => {
                state.transactionStatus = 'failed';
                state.error = action.error.message ?? 'Unable to fetch transaction'
            })
            .addCase(addTransaction.fulfilled, (state, action ) => {
                state.transactions.push(action.payload);
            })

            //Dashboard
            .addCase(fetchPortfolio.pending, (state) => {
            state.portfolioStatus = "loading";
            state.error = null;
            })

            .addCase(fetchPortfolio.fulfilled, (state, action) => {
            state.portfolioStatus = "idle";

            state.portfolio = action.payload.portfolio;

            state.holdings = action.payload.holdings;

            state.quotes = action.payload.quotes;
            })

            .addCase(fetchPortfolio.rejected, (state, action) => {
            state.portfolioStatus = "failed";
            state.error = action.error.message ?? "Unknown error";
            });

    },
});

export default portfolioSlice.reducer;


export const { setSelectedPortfolio } = portfolioSlice.actions;
// FinSight-A/src/features/portfolio/portfolioSlice.ts







