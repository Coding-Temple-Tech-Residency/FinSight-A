import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addHolding, addPortfolio, fetchHoldings, fetchPortfolios, removePortfolio, setSelectedPortfolio, removeHolding, fetchTransactions } from "../features/portfolio/portfolioSlice";
import type { Portfolio, Holding } from "../types/portfolio";
import AddHoldingForm from '../components/AddHoldingForm';
import PortfolioList from "../components/PortfolioList";
import HoldingCard from "../components/HoldingCard";
import HoldingList from "../components/HoldingsList";
import TransactionList from "../components/TransactionList";
import TransactionForm from '../components/TransactionForm';
import { getPortfolioInsights } from "../services/insightsAPI";
import { fetchPorfolioInsights } from "../features/insights/insightSlice";
import AIInsightCard from "../components/AIInsightsCard";

export default function PortfolioPage() {
    const dispatch = useAppDispatch();

    const { portfolioStatus, holdingStatus, error } = useAppSelector(
        (state) => state.portfolio
    );

    //quick verification
    const { insight, status } = useAppSelector(
        state => state.insights
    )

    console.log('AI Insight:', insight);
    console.log('AI Status:', status);
    console.log('AI Error:', error)

    const portfolios = useAppSelector(
        state => state.portfolio.portfolios
    );

    const selectedPortfolio = useAppSelector(
        state => state.portfolio.selectedPortfolio
    );

    const holdings = useAppSelector(
        state => state.portfolio.holdings
    )

    const [showHoldingForm, setShowHoldingForm] = useState(false);
    const [showTransactionForm, setShowTransactionForm] = useState(false);

    const handlePortfolioSelect = (
        portfolio: Portfolio
    ) => {

        console.log('Selected Portfolio', portfolio);

        dispatch(setSelectedPortfolio(portfolio));
        dispatch(fetchHoldings(portfolio.id));
        dispatch(fetchTransactions(portfolio.id))
        dispatch(fetchPorfolioInsights(portfolio.id))
    }

    const handleCreatePortfolio = () => {
        dispatch(addPortfolio({
            name: 'Growth Portfolio',

            description: 'Long-term investments',
        }))
    }

    const handleDeleteHolding = (
        holding: Holding
    ) => {
        if (!selectedPortfolio) return;

        const confirmed = window.confirm(`Are you sure you want to remove ${holding.symbol} from ${selectedPortfolio.name}`);

        if (!confirmed) return;

        dispatch(removeHolding({
            portfolioId: selectedPortfolio.id,
            holdingId: holding.id
        }));
    };

    const handleDeletePortfolio = (portfolioId: string) => {
        dispatch(removePortfolio(portfolioId));
    }

    // const handleAddHolding = () => {
    //     if (!selectedPortfolio) return;

    //     dispatch(
    //         addHolding({
    //             portfolioId: selectedPortfolio.id,
    //             holding:{
    //                 symbol:'AAPL',
    //                 quantity: 10,
    //                 avg_cost: 190
    //             }
    //         })
    //     )
    // }

    useEffect(() => {
        dispatch(fetchPortfolios());
    }, [dispatch]);

    useEffect(() => {
        getPortfolioInsights('5a489d2d-1c1e-4ec8-9c9d-f0e3816a7c36')
        .then(data => console.log(data))
        .catch(err => console.error(err))
    }, [])

    if (portfolioStatus === 'loading') {
        return <p>Loading portfolio...</p>; 
    }

    if (error) {
        return <p>{error}</p>;
    }

    console.log(portfolios);

    return (

        <div className="min-h-screen bg-slate-900 p-6 text-slate-100">
            <div className="mx-auto max-w-7xl space-y-6 rounded-xl border border-[#24354D] bg-[#101C31] p-4">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Portfolio</h1>
                    </div>
                    <button className="rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500 transition" onClick={handleCreatePortfolio}>
                        Create Portfolio
                    </button>
                </header>
                    {!selectedPortfolio && (
                        
                        <div className="text-center">
                            <p>
                                Select a portfolio to begin.
                            </p>
                        </div>
                    )}
                    <div>
                    <PortfolioList
                        portfolios={portfolios}
                        onSelect={handlePortfolioSelect}
                        onDelete={handleDeletePortfolio}
                    />
                    </div>

                    {selectedPortfolio && (
                        <div>
                            <div className="rounded-xl border border-[#24354D] bg-[#101C31] p-4">
                            <header className="flex items-center justify-between">
                            
                            <h2 className="text-2xl font-bold">
                                {selectedPortfolio.name}
                            </h2>

                            <button className="border rounded-lg py-2 px-2 bg-cyan-500 transition hover:bg-slate-500 mb-2 mt-2" onClick={() => setShowHoldingForm(true)}>
                                Add Holding
                            </button>
                            
                            </header>
                            <HoldingList
                            holdings={holdings}
                            portfolioId={selectedPortfolio.id}
                            onDelete={handleDeleteHolding}
                            />
                            <div>
                            
                            {showHoldingForm && (
                                <AddHoldingForm
                                portfolioId={
                                    selectedPortfolio.id
                                }
                                onClose={() => setShowHoldingForm(false)}
                                />
                            )}
                            </div> 
                            </div>
                            <div>
                                <AIInsightCard />
                            </div>
                            <div>
                           
                            <button 
                            className='border rounded-lg py-2 px-2 bg-cyan-500 mt-2 mb-2 transition hover:bg-slate-500'
                            onClick={() => setShowTransactionForm(true)}>
                                Add Transaction
                            </button>
                            {showTransactionForm && (
                                <TransactionForm
                                portfolioId={selectedPortfolio.id}
                                onClose={() => setShowTransactionForm(false)}
                                />
                            )}
                            </div>
                            <TransactionList />
                            
                        </div>
                    )}
                
            </div>
        </div>

    )
}