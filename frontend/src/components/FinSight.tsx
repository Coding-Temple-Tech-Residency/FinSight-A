// FinSight-A/frontend/src/components/FinSight.tsx

import { Link } from "react-router-dom";

export default function FinSight() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border border-[#24354D] bg-[#101C31] p-4">
      <div className="mb-4 flex justify-between">
        <h2 className="text-xl text-[#3DD6F5]">FinSight™️ Insight ✨</h2>

        <Link
          to="/signup?redirect=/chat"
          className="rounded bg-[#6C63FF] px-3 py-2 text-sm"
        >
          Ask Fin →
        </Link>
      </div>

      <p className="flex-1 leading-6 text-gray-300">
        AI infrastructure demand continues to accelerate, with technology
        leaders driving market momentum and investor interest.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <span className="text-gray-400">🔑 Key Theme:</span>{" "}
          <span className="text-[#3DD6F5]">AI & Cloud Growth</span>
          <p className="mt-1 text-sm leading-5 text-gray-400">
            Strong demand for AI infrastructure and cloud computing continues to
            shape momentum across major technology stocks.
          </p>
        </div>

        <div>
          <span className="text-gray-400">⚠️ Risk:</span>{" "}
          <span className="text-[#6C63FF]">Moderate</span>
          <p className="mt-1 text-sm leading-5 text-gray-400">
            Elevated valuations and shifting interest-rate expectations could
            create short-term volatility across growth-focused sectors.
          </p>
        </div>

        <div>
          <span className="text-gray-400">👀 Outlook:</span>{" "}
          <span className="text-green-400">Positive</span>
          <p className="mt-1 text-sm leading-5 text-gray-400">
            Continued investment in AI, cloud infrastructure, and digital
            services may support broader market growth through the coming
            quarters.
          </p>
        </div>

        <button className="mt-3 w-full rounded-lg bg-[#3DD6F5] py-2 text-[15px] font-semibold text-black transition hover:opacity-50">
          Explore Trending Stocks →
        </button>
      </div>
    </div>
  );
}
