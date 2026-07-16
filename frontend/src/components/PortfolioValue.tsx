// FinSight-A/frontend/src/components/PortfolioValue.tsx

import { useAppSelector } from "../app/hooks";
import { Link } from "react-router-dom";

export default function PortfolioValue() {
  const { data, status } = useAppSelector((state) => state.dashboard);

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-[#24354D] bg-[#101C31] p-4.5">
        <h2 className="mb-7 text-[20px] font-semibold text-white">
          💰 Portfolio Value
        </h2>

        <p className="py-20 text-center text-gray-400">Loading portfolio...</p>
      </div>
    );
  }

  const summary = data?.portfolio_summary;

  const totalValue = summary?.total_value ?? 0;
  const portfolioCount = summary?.count ?? 0;

  const todayChange = summary?.today_change ?? 0;
  const todayChangePercent = summary?.today_change_percent ?? 0;

  const totalReturn = summary?.total_return ?? 0;
  const totalReturnPercent = summary?.total_return_percent ?? 0;

  const cashAvailable = summary?.cash_available ?? 0;

  const bestPerformer = summary?.best_performer ?? "N/A";

  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101C31] p-4.5">
      <h2 className="mb-7 text-[20px] font-semibold text-white">
        💰 Portfolio Value
      </h2>

      <div className="mb-8 text-center">
        <p className="text-[34px] font-bold text-white">
          ${totalValue.toLocaleString()}
        </p>

        <p className="mt-3 text-[15px] font-semibold text-green-400">
          ▲ ${todayChange.toLocaleString()} ({todayChangePercent}%) Today
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#24354D] pb-2">
          <span className="text-gray-400">Total Return</span>

          <span className="font-semibold text-green-400">
            ${totalReturn.toLocaleString()} ({totalReturnPercent}%)
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-[#24354D] pb-2">
          <span className="text-gray-400">Cash Available</span>

          <span className="font-semibold text-white">
            ${cashAvailable.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-[#24354D] pb-2">
          <span className="text-gray-400">Portfolios</span>

          <span className="font-semibold text-white">{portfolioCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Best Performer</span>

          <span className="font-semibold text-[#3DD6F5]">{bestPerformer}</span>
        </div>
      </div>

      <Link
        to="/portfolio"
        className="mt-7 block w-full rounded-lg bg-[#3DD6F5] py-2 text-center text-[15px] font-semibold text-[#0D1B2A] transition hover:opacity-90"
      >
        View Portfolio →
      </Link>
    </div>
  );
}
