//FinSight-A/frontend/src/pages/LandingPage.tsx

import TrendingStocks from "../components/TrendingStocks";
import TrendingPerformance from "../components/TrendingPerformance";
import TrendingHighlights from "../components/TrendingHighlights";
import UnlockCard from "../components/UnlockCard";
import FinSight from "../components/FinSight";

export default function LandingPage() {
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-[#0D1B2A]">
      <main className="h-full w-full px-1 py-1">
        <div className="grid h-full grid-cols-12 gap-3">
          <div className="col-span-4 min-h-0">
            <TrendingStocks />
          </div>

          <div className="col-span-5 flex min-h-0 flex-col gap-1">
            <TrendingPerformance />
            <div className="flex-1">
              <TrendingHighlights />
            </div>
          </div>

          <div className="col-span-3 flex min-h-0 flex-col gap-1">
            <UnlockCard />
            <div className="flex-1">
              <FinSight />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
