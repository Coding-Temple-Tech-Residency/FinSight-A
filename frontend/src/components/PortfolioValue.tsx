// FinSight-A/frontend/src/components/PortfolioValue.tsx

export default function PortfolioValue() {
  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101C31] p-4.5">
      <h2 className="mb-7 text-[20px] font-semibold text-white">
        💰 Portfolio Value
      </h2>

      <div className="mb-8 text-center">
        <p className="text-[34px] font-bold text-white">
          $184,235.42
        </p>

        <p className="mt-3 text-[15px] font-semibold text-green-400">
          ▲ +$1,248.53 (+0.68%) Today
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#24354D] pb-2">
          <span className="text-gray-400">Total Return</span>
          <span className="font-semibold text-green-400">
            +$42,115 (+29.6%)
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-[#24354D] pb-2">
          <span className="text-gray-400">Cash Available</span>
          <span className="font-semibold text-white">
            $8,932
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-[#24354D] pb-2">
          <span className="text-gray-400">Holdings</span>
          <span className="font-semibold text-white">
            18
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Best Performer</span>
          <span className="font-semibold text-[#3DD6F5]">
            NVDA +28.4%
          </span>
        </div>
      </div>

      <button className="mt-7 w-full rounded-lg bg-[#3DD6F5] py-2 text-[15px] font-semibold text-[#0D1B2A] transition hover:opacity-90">
        View Portfolio →
      </button>
    </div>
  );
}