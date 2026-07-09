//FinSight-A/frontend/src/components/FinSight.tsx

export default function FinSight() {
  return (
    <div className="rounded-xl border border[#24354D] bg-[#101C31] p-6">
      <div className="mb-6 flex justify-between">
        <h2 className="text-2xl">🦈 FinSight Insight ✨</h2>

        <span className="rounded bg-[#6c63ff] px-3 py-1 text-sm">
          AI Insight
        </span>
      </div>

      <p className="leading-8">
        AI infrastructure demand continues to accelerate...
      </p>

      <div className="mt-8 space-y-4">
        <div>
          <span className="text-gray-400">🔑 Key Theme:</span>{" "}
          <span className="text-[#3DD6F5]">AI & Cloud Growth</span>
        </div>

        <div>
          <span className="text-gray-400">⚠️ Risk:</span>{" "}
          <span className="text-[#6C63FF]">Moderate</span>
        </div>

        <div>
          <span className="text-gray-400">👀 Outlook:</span>{" "}
          <span className="text-green-400">Positive</span>
        </div>

        <button className="mt-10 w-full rounded-lg bg-[#6C63FF] py-4 text-xl">
          Explore Trending Stocks →
        </button>
      </div>
    </div>
  );
}