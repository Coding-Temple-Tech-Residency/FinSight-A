// FinSight-A/frontend/src/components/PortfolioPerformance.tsx

import { useState } from "react";
import { useAppSelector } from "../app/hooks";
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

const timeframes = ["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"] as const;

export default function PortfolioPerformance() {
  const { data } = useAppSelector((state) => state.dashboard);

  const [selectedTimeframe, setSelectedTimeframe] =
    useState<(typeof timeframes)[number]>("YTD");

  const performance = data?.performance ?? [];

  return (
    <div className="rounded-2xl max-h-[250px] border border-[#24354D] bg-[#0F1B2D] p-2">
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
          <LineChart data={performance}>
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
              dataKey="portfolio"
              name="Portfolio"
              stroke="#3DD6F5"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="benchmark"
              name="S&P 500"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}