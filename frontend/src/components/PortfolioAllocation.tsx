// FinSight-A/frontend/src/components/PortfolioAllocation.tsx

const allocations = [
  { sector: "Technology", percentage: 56.2 },
  { sector: "Consumer Cyclical", percentage: 18.7 },
  { sector: "Healthcare", percentage: 9.4 },
  { sector: "Financials", percentage: 6.8 },
  { sector: "Consumer Staples", percentage: 5.6 },
  { sector: "Other", percentage: 3.3 },
];

export default function PortfolioAllocation() {
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
          <div
            key={item.sector}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-cyan-400" />

              <span className="text-slate-200">
                {item.sector}
              </span>
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
        <span className="font-medium text-white">
          Total
        </span>

        <span className="font-semibold text-white">
          100.0%
        </span>
      </div>
    </section>
  );
}