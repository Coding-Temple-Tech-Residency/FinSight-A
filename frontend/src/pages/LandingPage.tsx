//FinSight-A/frontend/src/pages/LandingPage.tsx

import TrendingStocks from "../components/TrendingStocks";
import TrendingPerformance from "../components/TrendingPerformance";
import TrendingHighlights from "../components/TrendingHighlights";
import UnlockCard from "../components/UnlockCard";
import FinSight from "../components/FinSight";

export default function LandingPage() {
  return (
    <div className="max-h-screen bg-[#0D1B2A]">
      <main className="w-full px-1 py-1">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <TrendingStocks />
          </div>

          <div className="col-span-5 space-y-2">
            <TrendingPerformance />
            <TrendingHighlights />
          </div>

          <div className="col-span-3 space-y-3">
            <UnlockCard />
            <FinSight />
          </div>
        </div>
      </main>
    </div>
  );
}
