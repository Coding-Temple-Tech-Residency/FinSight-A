// FinSight-A/frontend/src/pages/DashboardPage.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchPortfolio,
  fetchPortfolios,
} from "../features/portfolio/portfolioSlice";
import { fetchWatchlist } from "../features/watchlist/watchlistSlice";
import { fetchDashboard } from "../features/dashboard/dashboardSlice";

import PortfolioAllocation from "../components/PortfolioAllocation";
import PortfolioPerformance from "../components/PortfolioPerformance";
import PortfolioHighlights from "../components/PortfolioHighlights";
import PortfolioValue from "../components/PortfolioValue";
import PortfolioInsight from "../components/PortfolioFinSight";
import Watchlist from "../components/Watchlist";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const selectedPortfolio = useAppSelector(
    (state) => state.portfolio.selectedPortfolio,
  );
  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchPortfolios());
    dispatch(fetchWatchlist());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPortfolio) {
      dispatch(fetchPortfolio(selectedPortfolio.id));
    }
  }, [selectedPortfolio, dispatch]);

  return (
    <div className="max-h-screen bg-[#0D1B2A]">
      <main className="w-full px-1 py-1">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <PortfolioAllocation />
          </div>

          <div className="col-span-5 space-y-2">
            <PortfolioPerformance />
            <PortfolioHighlights />
          </div>

          <div className="col-span-3">
            <PortfolioValue />
          </div>

          {/* Full-width AI card and Watchlist */}
          <div className="col-span-12">
            <Watchlist />
            <PortfolioInsight />
          </div>
        </div>
      </main>
    </div>
  );
}
