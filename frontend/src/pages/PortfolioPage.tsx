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

export default function PortfolioPage() {
    const dispatch = useAppDispatch();

    const { portfolioStatus, holdingStatus, error } = useAppSelector(
        (state) => state.portfolio
    );

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


    if (portfolioStatus === 'loading') {
        return <p>Loading portfolio...</p>; 
    }

    if (error) {
        return <p>{error}</p>;
    }

    console.log(portfolios);

    return (
        <div>
            <h1>Portfolio</h1>

            <button onClick={handleCreatePortfolio}>
                Create Portfolio
            </button>

            {!selectedPortfolio && (
                
                <div>
                    <p>
                        Select a portfolio to begin.
                    </p>
                </div>
            )}
            <PortfolioList
                portfolios={portfolios}
                onSelect={handlePortfolioSelect}
                onDelete={handleDeletePortfolio}
            />

            {selectedPortfolio && (
                <div>
                    <h2>
                        {selectedPortfolio.name}
                    </h2>

                    <HoldingList
                    holdings={holdings}
                    portfolioId={selectedPortfolio.id}
                    onDelete={handleDeleteHolding}
                    />

                    <button onClick={() => setShowHoldingForm(true)}>
                        Add Holding
                    </button>
                    {showHoldingForm && (
                        <AddHoldingForm
                        portfolioId={
                            selectedPortfolio.id
                        }
                        onClose={() => setShowHoldingForm(false)}
                        />
                    )}
                    <button onClick={() => setShowTransactionForm(true)}>
                        Add Transaction
                    </button>
                    {showTransactionForm && (
                        <TransactionForm
                        portfolioId={selectedPortfolio.id}
                        onClose={() => setShowTransactionForm(false)}
                        />
                    )}
                    <TransactionList />
                    
                </div>
            )}
        </div>
    )
}