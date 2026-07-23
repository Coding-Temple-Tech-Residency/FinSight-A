// FinSight-A/frontend/src/components/PortfolioFinSight.tsx

import { useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchPortfolioInsights } from "../features/insights/insightSlice";

export default function PortfolioFinSight() {
  const dispatch = useAppDispatch();

  const selectedPortfolio = useAppSelector(
    (state) => state.portfolio.selectedPortfolio,
  );

  const { insight, status, error } = useAppSelector(
    (state) => state.insights,
  );

  useEffect(() => {
    if (!selectedPortfolio?.id) return;

    dispatch(fetchPortfolioInsights(selectedPortfolio.id));
  }, [dispatch, selectedPortfolio?.id]);

  const recommendation =
    insight?.summary ?? "Generating personalized portfolio insight...";

  return (
    <div className="rounded-xl min-h-[150px] border border-[#24354D] bg-[#101C31] p-4">
      <div className="grid grid-cols-[300px_1fr_200px] items-center gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-5">
          <img
            src={logo}
            alt="FinSight"
            className="h-25 w-25 object-contain"
          />

          <h2 className="text-[20px] font-semibold text-white">
            FinSight™️ Insight:
          </h2>
        </div>

        {/* Recommendation */}
        <div>
          <p className="text-[15px] text-gray-300">
            {status === "loading"
              ? "Generating personalized portfolio insight..."
              : error
                ? "FinSight insight is temporarily unavailable."
                : recommendation}
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <Link to="/chat">
            <button className="rounded-lg bg-[#3DD6F5] px-5 py-2 text-[14px] font-semibold text-black transition hover:opacity-50">
              Ask Fin →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}