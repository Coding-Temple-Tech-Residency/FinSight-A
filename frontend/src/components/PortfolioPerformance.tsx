// FinSight-A/frontend/src/components/PortfolioPerformance.tsx

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchPortfolioPerformance } from "../features/portfolio/portfolioSlice";
import type { PerformanceRange } from "../types/portfolio";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const timeframes: PerformanceRange[] = ["1W", "1M", "YTD", "1Y"];

export default function PortfolioPerformance() {
  const dispatch = useAppDispatch();

  const { portfolio, performance } = useAppSelector(
    (state) => state.portfolio,
  );

  const [selectedTimeframe, setSelectedTimeframe] =
    useState<PerformanceRange>("YTD");

  useEffect(() => {
    if (!portfolio?.id) return;

    dispatch(
      fetchPortfolioPerformance({
        portfolioId: portfolio.id,
        range: selectedTimeframe,
      }),
    );
  }, [dispatch, portfolio?.id, selectedTimeframe]);

  const performanceData = performance?.series ?? [];

  return (
    <div className="rounded-2xl border border-[#24354D] bg-[#0F1B2D] p-2">
      <h2 className="mb-4 text-[20px] font-semibold text-white">
        📈 Portfolio Performance
      </h2>

      <div className="mb-4 flex justify-between">
        {timeframes.map((time) => (
          <button
            key={time}
            onClick={() => setSelectedTimeframe(time)}
            className={`px-1 py-1 text-[13px] transition ${
              time === selectedTimeframe
                ? "bg-[#3DD6F5] font-semibold text-[#0D1B2A]"
                : "text-gray-300 hover:bg-[#16233A]"
            }`}
          >
            {time}
          </button>
        ))}
      </div>

      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid stroke="#24354D" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="value"
              name="Portfolio"
              stroke="#3DD6F5"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}