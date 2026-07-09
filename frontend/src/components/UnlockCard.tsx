//FinSight-A/frontend/src/components/UnlockCard.tsx

export default function UnlockCard() {
  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101c31] p-8">
      <button className="mt-8 w-full rounded-lg bg-[#3DD6F5] py-4 text-xl font-semibold text-[#0D1B2A]">
        {" "}
        Sign Up Free
      </button>

      <div className="mb-6 text-center text-6xl">🔐</div>

      <h2 className="text-center text-6xl">
        Unlock Full Insight and FinSight™️
      </h2>

      <p className="mt-4 text-center text-gray-300">
        Get portfolio analysis, advanced screeners, and real-time alerts.
      </p>

      <p className="mt-5 text-center text-sm text-gray-400">
        No credit card required.
      </p>
    </div>
  );
}
