//FinSight-A/frontend/src/components/TrendingPerformance.tsx

export default function TrendingPerformace() {
  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101c31] p-6">
      <h2 className="mb-5 text-xl font-semibold">
        Trending Stocks Performance (YTD)
      </h2>

      <div className="h-[260px] rounded-lg bg-[#0D1B2A]">
        <div className="mt-5 flex justify-between">
          {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((x) => (
            <button
              key={x}
              className={`rounded border border-[#24354D] px-4 py-2" ${
                x === "YTD" ? "bg-[#3DD6f5] text-[#0D1B2A]" : ""
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
