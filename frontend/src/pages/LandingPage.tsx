//FinSight-A/frontend/src/pages/LandingPage.tsx

import TrendingStocks from "../components/TrendingStocks";
import TrendingPerformance from "../components/TrendingPerformance";
import TrendingHighlights from "../components/TrendingHighlights";
import UnlockCard from "../components/UnlockCard";
import FinSight from "../components/FinSight";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <main className="mx-auto max-w-[1500px] p-6">
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-3">
            <TrendingStocks />
          </div>

          <div className="col-span-6 space-y-5">
            <TrendingPerformance />
            <TrendingHighlights />
          </div>

          <div className="col-span-3 space-y-5">
            <UnlockCard />
            <FinSight />
          </div>
        </div>
      </main>
    </div>
  );
}