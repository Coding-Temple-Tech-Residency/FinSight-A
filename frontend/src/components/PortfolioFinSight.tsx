//FinSight-A/frontend/src/components/PortfolioFinSight.tsx

import logo from "../assets/logo.png";

export default function PortfolioFinSight() {
  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101C31] p-4">
      <div className="grid grid-cols-[300px_1fr_200px] items-center gap-4">

        {/* Logo + Title */}
        <div className="flex items-center gap-5">
          <img
            src={logo}
            alt="FinSight"
            className="h-15 w-15 object-contain"
          />

          <h2 className="text-[20px] font-semibold text-white">
            FinSight™️ Insight:
          </h2>
        </div>

        {/* Recommendation */}
        <div>
          <p className="text-[15px] text-gray-300">
            Consider trimming Technology exposure by 5–10% and adding
            Healthcare to improve diversification.
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button className="rounded-lg bg-[#6C63FF] px-5 py-2 text-[14px] font-semibold text-white transition hover:opacity-90">
            Ask FinSight →
          </button>
        </div>

      </div>
    </div>
  );
}