//FinSight-A/frontend/src/components/TrendingHighlights.tsx

export default function TrendingHighlights() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[#24354D] bg-[#0F1B2D] p-3">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-[20px]">⚡</span>

        <h2 className="text-[20px] font-semibold text-white">
          Trending Highlights
        </h2>
      </div>

      <div className="flex flex-1 flex-col justify-evenly gap-3">
        <article className="flex items-center gap-4 rounded-xl border border-[#24354D] bg-[#162337] px-4 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-3xl">
            🤖
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-white">
              NVIDIA (NVDA)
            </h3>

            <p className="mt-1 text-[12px] text-gray-300">
              NVIDIA continues benefiting from demand for AI infrastructure,
              with data center revenue a major growth driver.
            </p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-xl border border-[#24354D] bg-[#162337] px-4 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-3xl">
            🍎
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-white">
              Apple (AAPL)
            </h3>

            <p className="mt-1 text-[12px] text-gray-300">
              Apple reported stronger-than-expected earnings this quarter,
              driven by Services revenue and stable iPhone sales.
            </p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-xl border border-[#24354D] bg-[#162337] px-4 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-3xl">
            🍫
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-white">
              Hershey (HSY)
            </h3>

            <p className="mt-1 text-[12px] text-gray-300">
              Hershey faces higher cocoa production costs, which may pressure
              future profit margins.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
