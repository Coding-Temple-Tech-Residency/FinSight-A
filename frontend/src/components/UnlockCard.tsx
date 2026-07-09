//FinSight-A/frontend/src/components/UnlockCard.tsx

export default function UnlockCard() {
  return (
    <div className="max-h-[200px] rounded-xl border border-[#24354D] bg-[#101c31] p-2">
      <button className="mb-1 w-full rounded-md bg-[#3DD6F5] py-1 text-[12px] font-semibold text-[#0D1B2A]">
        Sign Up Free
      </button>

      <div className="mb-1 text-center text-[24px]">
        🔐 → 🔓
      </div>

      <h2 className="text-center text-[12px] font-semibold leading-tight text-white">
        Unlock Full FinSight™️
      </h2>

      <p className="mt-1 text-center text-[12px] leading-tight text-gray-300">
        Portfolio analysis, screeners,
        <br />
        and real-time alerts.
      </p>

      <p className="mt-1 text-center text-[10px] text-gray-500">
        No credit card required.
      </p>
    </div>
  );
}