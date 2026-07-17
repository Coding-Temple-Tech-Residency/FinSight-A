// FinSight-A/frontend/src/components/Watchlist.tsx

import { Link } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function Watchlist() {
  const { items } = useAppSelector((state) => state.watchlist);

  const preview = items.slice(0, 5);

  return (
    <div className="rounded-xl max-h-[5000px] border border-[#24354D] bg-[#101C31] p-1">
      <div className="mb-2 flex justify-between">
        <h2 className="text-xl">⭐ Watchlist</h2>

        <span className="rounded bg-[#6C63FF] px-2 py-1 text-sm">
          {items.length} Stocks
        </span>
      </div>

      <div className="space-y-2">
        {preview.length === 0 ? (
          <p className="text-gray-400">
            Your watchlist is empty.
          </p>
        ) : (
          preview.map((stock) => (
            <div
              key={stock.id}
              className="flex justify-between"
            >
              <span>{stock.symbol}</span>

              <span className="text-[#3DD6F5]">
                Watching
              </span>
            </div>
          ))
        )}
      </div>

      <Link to="/watchlist">
        <button className="mt-6 w-full rounded-lg bg-[#6C63FF] py-2 text-xl">
          View Full Watchlist →
        </button>
      </Link>
    </div>
  );
}