//FinSight-A/frontend/src/components/UnlockCard.tsx
import SignupButton from "./SignupButton";

export default function UnlockCard() {
  return (
    <div className="shrink-0 rounded-xl border border-[#24354D] bg-[#101C31] p-1">
      <SignupButton />

      <div className="my-3 text-center text-[28px]">🔐 → 🔓</div>

      <h2 className="text-center text-[16px] font-semibold leading-tight text-[#3DD6F5]">
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
