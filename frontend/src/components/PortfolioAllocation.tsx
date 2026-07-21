// FinSight-A/frontend/src/components/PortfolioAllocation.tsx

import { useAppSelector } from "../app/hooks";

export default function PortfolioAllocation() {
  const { holdings, quotes } = useAppSelector((state) => state.portfolio);

  const allocationHoldings =
    holdings.map((holding) => {
      const quote = quotes[holding.symbol];

      const currentPrice = Number(quote?.price ?? 0);
      const quantity = Number(holding.quantity);

      return {
        symbol: holding.symbol,
        value: quantity * currentPrice,
      };
    }) ?? [];

  const totalValue = allocationHoldings.reduce(
    (sum, holding) => sum + holding.value,
    0,
  );

  const allocations = allocationHoldings
    .map((holding) => ({
      symbol: holding.symbol,
      percentage: totalValue === 0 ? 0 : (holding.value / totalValue) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <section className="rounded-lg border border-slate-700 bg-[#091827] p-5 h-110">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🟣</span>

          <h2 className="text-xl font-semibold text-white">
            Portfolio Allocation
          </h2>
        </div>

        <button className="text-slate-400 hover:text-cyan-400 transition">
          ☰
        </button>
      </div>

      {/* Allocation List */}
      <div className="space-y-5">
        {allocations.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-cyan-400" />

              <span className="text-slate-200">{item.symbol}</span>
            </div>

            <span className="text-slate-300">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-slate-700" />

      {/* Total */}
      <div className="flex items-center justify-between text-lg">
        <span className="font-medium text-white">Total</span>

        <span className="font-semibold text-white">
          {totalValue > 0 ? "100.0%" : "—"}
        </span>
      </div>
    </section>
  );
}
