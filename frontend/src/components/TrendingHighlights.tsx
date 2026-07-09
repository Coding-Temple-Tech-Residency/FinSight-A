//FinSight-A/frontend/src/components/TrendingHighlights.tsx

export default function TrendingHighlight() {
  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101c31] p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-2xl">⚡️</span>

        <h2 className="text-3xl font-semibold">Trending Highlights</h2>

        <div className="space-y-4">
          <article className="flex gap-4 rounded-lg border border-[#24354D] bg-[#162337] p-4">
            <img
              src="/logos/nvidia.png"
              alt="NVIDIA"
              className="h-14 w-14 rounded"
            />

            <div>
              <h3 className="text-xl font-semibold">NVIDIA (NVDA)</h3>

              <p className="mt-2 text-gray-300">
                NVIDIA continues benefiting from demand for AI infrastructure,
                with data center revenue a major growth driver.
              </p>
            </div>
          </article>

          <article className="flex gap-4 rounded-lg border border-[#24354D] bg-[#162337] p-4">
            <img
              src="/logos/apple.png"
              alt="Apple"
              className="h-14 w-14 rounded"
            />

            <div>
              <h3 className="text-xl font-semibold">Apple (AAPL)</h3>

              <p className="mt-2 text-gray-300">
                Apple reported stronger-than-expected earnings this quarter,
                driven by Services revenue and stable iPhone sales.
              </p>
            </div>
          </article>

          <article className="flex gap-4 rounded-lg border border-[#24354D] bg-[#162337] p-4">
            <img
              src="/logos/hershey.png"
              alt="Hershey"
              className="h-14 w-14 rounded"
            />

            <div>
              <h3 className="text-xl font-semibold">Hershey (HSY)</h3>

              <p className="mt-2 text-gray-300">
                Hershey faces higher cocoa production costs, which may pressure
                future profit margins.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
