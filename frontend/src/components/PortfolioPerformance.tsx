// FinSight-A/frontend/src/components/PortfolioPerformance.tsx

export default function PortfolioPerformance() {
  return (
    <div className="rounded-2xl max-h-[250px] border border-[#24354D] bg-[#0F1B2D] p-2">
      <h2 className="mb-4 text-[20px] font-semibold text-white">
        📈 Portfolio Performance
      </h2>

      <div className="mb-4 flex justify-between">
        {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((time) => (
          <button
            key={time}
            className={`px-1 py-1 text-[13px] transition ${
              time === "YTD"
                ? "bg-[#3DD6F5] font-semibold text-[#0D1B2A]"
                : "text-gray-300 hover:bg-[#16233A]"
            }`}
          >
            {time}
          </button>
        ))}
      </div>

      <div className="p-1">
        <svg
          viewBox="0 0 900 300"
          className="h-[150px] w-full"
          fill="none"
        >
          {/* Grid */}
          <line x1="0" y1="250" x2="900" y2="250" stroke="#24354D" />
          <line x1="0" y1="190" x2="900" y2="190" stroke="#1B2A42" />
          <line x1="0" y1="130" x2="900" y2="130" stroke="#1B2A42" />
          <line x1="0" y1="70" x2="900" y2="70" stroke="#1B2A42" />

          {/* Portfolio */}
          <path
            d="M40 235 L120 228 L200 215 L280 205 L360 188 L440 170 L520 150 L600 128 L680 105 L760 85 L840 60"
            stroke="#3DD6F5"
            strokeWidth="5"
            fill="none"
          />

          {/* Benchmark */}
          <path
            d="M40 235 L120 232 L200 225 L280 214 L360 205 L440 193 L520 180 L600 168 L680 155 L760 142 L840 128"
            stroke="#64748B"
            strokeWidth="3"
            strokeDasharray="8 8"
            fill="none"
          />

          {/* Legend */}
          <text x="20" y="20" fill="#3DD6F5" fontSize="24">
            Portfolio
          </text>

          <text x="180" y="20" fill="#94A3B8" fontSize="24">
            S&amp;P 500
          </text>
        </svg>
      </div>
    </div>
  );
}