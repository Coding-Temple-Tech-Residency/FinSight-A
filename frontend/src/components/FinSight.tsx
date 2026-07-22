//FinSight-A/frontend/src/components/FinSight.tsx

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchPortfolioInsights } from "../features/insights/insightSlice";

export default function FinSight() {
  const dispatch = useAppDispatch();

  const selectedPortfolio = useAppSelector(
    (state) => state.portfolio.selectedPortfolio
  );

  const { insight, status, error } = useAppSelector(
    (state) => state.insights
  );

  useEffect(() => {
    if (selectedPortfolio?.id) {
      dispatch(fetchPortfolioInsights(selectedPortfolio.id));
    }
  }, [dispatch, selectedPortfolio?.id]);

  return (
    <div className="rounded-xl max-h-[500px] border border[#24354D] bg-[#101C31] p-3">
      <div className="mb-6 flex justify-between">
        <h2 className="text-xl">FinSight™️ Insight ✨</h2>

        <span className="rounded bg-[#6c63ff] px-3 py-2 text-sm">
          FinSight ™️
        </span>
      </div>

      <p className="leading-6">
        {status === "loading"
          ? "Analyzing your portfolio..."
          : error
            ? "FinSight insight is temporarily unavailable."
            : insight?.summary ?? "No portfolio insight available yet."}
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <span className="text-gray-400">🔑 Key Theme:</span>{" "}
          <span className="text-[#3DD6F5]">
            {insight?.diversification ?? "Not available"}
          </span>
        </div>

        <div>
          <span className="text-gray-400">⚠️ Risk:</span>{" "}
          <span className="text-[#6C63FF]">
            {insight?.risk ?? "Not available"}
          </span>
        </div>

        <div>
          <span className="text-gray-400">👀 Outlook:</span>{" "}
          <span className="text-green-400">
            {insight?.health_score != null
              ? `${insight.health_score}/100`
              : "Not available"}
          </span>
        </div>

        <button className="mt-3 w-full rounded-lg bg-[#6C63FF] py-2 text-xl">
          Explore Trending Stocks →
        </button>
      </div>
    </div>
  );
}