// FinSight-A/frontend/src/pages/DashboardPage.tsx

import PortfolioAllocation from "../components/PortfolioAllocation";
import PortfolioPerformance from "../components/PortfolioPerformance";
import PortfolioHighlights from "../components/PortfolioHighlights";
import PortfolioValue from "../components/PortfolioValue";
import PortfolioInsight from "../components/PortfolioFinSight";

export default function DashboardPage() {
  return (
    <div className="max-h-screen bg-[#0D1B2A]">
      <main className="w-full px-1 py-1">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <PortfolioAllocation />
          </div>

          <div className="col-span-5 space-y-2">
            <PortfolioPerformance />
            <PortfolioHighlights />
          </div>

          <div className="col-span-3">
            <PortfolioValue />
          </div>

          {/* Full-width AI card */}
          <div className="col-span-12">
            <PortfolioInsight />
          </div>
        </div>
      </main>
    </div>
  );
}
