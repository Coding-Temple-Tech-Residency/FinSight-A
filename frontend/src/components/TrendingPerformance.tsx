//FinSight-A/frontend/src/components/TrendingPerformance.tsx

export default function TrendingPerformance() {
  return (
    <div className="shrink-0 rounded-2xl border border-[#24354D] bg-[#0F1B2D] p-3">
      <h2 className="mb-4 text-[20px] font-semibold text-white">
        📈 Trending Stock Performance (YTD)
      </h2>

      <div className="mb-4 flex justify-between">
        {["1D", "1W", "1M", "3M", "YTD", "1Y", "ALL"].map((time) => (
          <button
            key={time}
            className={`rounded-md px-2 py-1 text-[13px] transition ${
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
        <svg viewBox="0 0 900 300" className="h-[150px] w-full" fill="none">
          {/* Grid */}
          <line x1="0" y1="250" x2="900" y2="250" stroke="#24354D" />
          <line x1="0" y1="190" x2="900" y2="190" stroke="#1B2A42" />
          <line x1="0" y1="130" x2="900" y2="130" stroke="#1B2A42" />
          <line x1="0" y1="70" x2="900" y2="70" stroke="#1B2A42" />

          {/* Apple */}
          <path
            d="M40 220 L120 210 L200 195 L280 175 L360 165 L440 145 L520 130 L600 115 L680 95 L760 85 L840 70"
            stroke="#3DD6F5"
            strokeWidth="4"
            fill="none"
          />

          {/* NVIDIA */}
          <path
            d="M40 235 L120 225 L200 215 L280 190 L360 170 L440 140 L520 110 L600 90 L680 70 L760 55 L840 35"
            stroke="#22C55E"
            strokeWidth="4"
            fill="none"
          />

          {/* Tesla */}
          <path
            d="M40 240 L120 235 L200 225 L280 215 L360 200 L440 185 L520 170 L600 160 L680 145 L760 130 L840 120"
            stroke="#EF4444"
            strokeWidth="4"
            fill="none"
          />

          {/* Microsoft */}
          <path
            d="M40 225 L120 215 L200 205 L280 190 L360 180 L440 170 L520 155 L600 145 L680 130 L760 115 L840 100"
            stroke="#FBBF24"
            strokeWidth="4"
            fill="none"
          />

          {/* Amazon */}
          <path
            d="M40 230 L120 220 L200 210 L280 195 L360 185 L440 170 L520 160 L600 150 L680 135 L760 120 L840 105"
            stroke="#A855F7"
            strokeWidth="4"
            fill="none"
          />

          {/* Legend */}
          <text x="20" y="20" fill="#3DD6F5" fontSize="24">
            AAPL
          </text>

          <text x="100" y="20" fill="#22C55E" fontSize="24">
            NVDA
          </text>

          <text x="180" y="20" fill="#EF4444" fontSize="24">
            TSLA
          </text>

          <text x="260" y="20" fill="#FBBF24" fontSize="24">
            MSFT
          </text>

          <text x="340" y="20" fill="#A855F7" fontSize="24">
            AMZN
          </text>
        </svg>
      </div>
    </div>
  );
}
