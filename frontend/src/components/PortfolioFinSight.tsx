//FinSight-A/frontend/src/components/PortfolioFinSight.tsx

import { useEffect } from "react";
import logo from "../assets/logo.png";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { sendMessage } from "../features/chat/chatSlice";

export default function PortfolioFinSight() {
  const dispatch = useAppDispatch();
  const { messages, insight, status } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (messages.length === 0 && status === "idle") {
      dispatch(
        sendMessage(
          `Review my portfolio, watchlist, and current market conditions.

Return EXACTLY in this format:

Insight:
<one concise investment insight>

Best:
<one sentence about the strongest holding or opportunity>

Attention:
<one sentence describing the biggest risk or concern>

Do not use bullet points.
Do not include markdown.
Do not include any additional text.`,
        ),
      );
    }
  }, [dispatch, messages.length, status]);

  const recommendation = insight ?? "Generating personalized insight...";

  return (
    <div className="rounded-xl border border-[#24354D] bg-[#101C31] p-4">
      <div className="grid grid-cols-[300px_1fr_200px] items-center gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-5">
          <img src={logo} alt="FinSight" className="h-15 w-15 object-contain" />

          <h2 className="text-[20px] font-semibold text-white">
            FinSight™️ Insight:
          </h2>
        </div>

        {/* Recommendation */}
        <div>
          <p className="text-[15px] text-gray-300">
            {status === "loading"
              ? "Generating personalized insight..."
              : recommendation}
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button className="rounded-lg bg-[#6C63FF] px-5 py-2 text-[14px] font-semibold text-white transition hover:opacity-90">
            Ask Fin →
          </button>
        </div>
      </div>
    </div>
  );
}
