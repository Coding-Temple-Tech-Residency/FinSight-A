// FinSight-A/frontend/src/components/Watchlist.tsx

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchWatchlistQuotes } from "../features/watchlist/watchlistSlice";

export default function Watchlist() {
  const dispatch = useAppDispatch();

  const { items, quotes } = useAppSelector((state) => state.watchlist);

  const preview = items.slice(0, 5);

  useEffect(() => {
    if (preview.length > 0) {
      dispatch(fetchWatchlistQuotes(preview));
    }
  }, [dispatch, items]);

  return (
    <div className="rounded-xl max-h-[5000px] border border-[#24354D] bg-[#101C31] p-1">
      <div className="mb-2 flex justify-between">
        <h2 className="text-xl text-white">⭐ Watchlist</h2>

        <span className="rounded bg-[#6C63FF] px-2 py-1 text-sm">
          {items.length} Stocks
        </span>
      </div>

      <div className="space-y-2">
        {preview.length === 0 ? (
          <p className="text-gray-400">Your watchlist is empty.</p>
        ) : (
          preview.map((stock) => {
            const quote = quotes[stock.symbol];

            const price = Number(quote?.price);
            const changePercent = Number(
              quote?.changePercent?.replace("%", ""),
            );

            const hasQuote = quote?.price !== undefined && !Number.isNaN(price);

            const isPositive =
              !Number.isNaN(changePercent) && changePercent >= 0;

            return (
              <div key={stock.id} className="flex items-center justify-between">
                <span className="font-medium text-white">{stock.symbol}</span>

                {hasQuote ? (
                  <div className="flex items-center gap-4">
                    <span>
                      {price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>

                    <span
                      className={isPositive ? "text-green-400" : "text-red-400"}
                    >
                      {isPositive ? "▲" : "▼"}{" "}
                      {Math.abs(changePercent).toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">Market data unavailable</span>
                )}
              </div>
            );
          })
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
