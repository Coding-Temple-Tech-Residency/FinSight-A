// FinSight-A/frontend/src/components/PortfolioHighlights.tsx

import { useAppSelector } from "../app/hooks";

export default function PortfolioHighlights() {
  const { best, attention } = useAppSelector((state) => state.chat);

  return (
    <div className="rounded-2xl border border-[#24354D] bg-[#0F1B2D] p-1">
      <div className="mb-1 flex items-center gap-5">
        <span className="text-[24px]">💼</span>

        <h2 className="text-white">Portfolio Highlights</h2>
      </div>

      <div className="space-y-2">
        <article className="flex items-center gap-1 rounded-xl border border-[#24354D] bg-[#162337] p-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-3xl">
            📈
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-white">
              Best Performer
            </h3>

            <p className="mt-1 text-[12px] text-gray-300">{best}</p>
          </div>
        </article>

        <article className="flex items-center gap-1 rounded-xl border border-[#24354D] bg-[#162337] p-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-3xl">
            ⚠️
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-white">
              Needs Attention
            </h3>

            <p className="mt-1 text-[12px] text-gray-300">{attention}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
