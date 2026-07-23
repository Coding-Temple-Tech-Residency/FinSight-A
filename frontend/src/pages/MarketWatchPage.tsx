// FinSight-A/src/pages/MarketWatchPage.tsx

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  clearQuote,
  fetchQuote,
  fetchTrends,
} from "../features/market/marketSlice";
import {
  addToWatchlist,
  fetchWatchlist,
  removeFromWatchlist,
} from "../features/watchlist/watchlistSlice";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

export default function MarketWatchPage() {
  const dispatch = useAppDispatch();

  const { trends, quote, status, quoteStatus, error, quoteError } =
    useAppSelector((state) => state.market);

  const {
    items: watchlist,
    status: watchlistStatus,
    error: watchlistError,
  } = useAppSelector((state) => state.watchlist);

  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    dispatch(fetchTrends());
    dispatch(fetchWatchlist());
  }, [dispatch]);

  const chartData = useMemo(
    () => [
      ...(trends?.top_gainers ?? []).slice(0, 5).map((stock) => ({
        ticker: stock.ticker,
        change: parseFloat(stock.change_percentage?.replace("%", "") ?? "0"),
        type: "gainer" as const,
      })),
      ...(trends?.top_losers ?? []).slice(0, 5).map((stock) => ({
        ticker: stock.ticker,
        change: parseFloat(stock.change_percentage?.replace("%", "") ?? "0"),
        type: "loser" as const,
      })),
    ],
    [trends],
  );

  const searchableStocks = useMemo(() => {
    const stocks = [
      ...(trends?.top_gainers ?? []),
      ...(trends?.top_losers ?? []),
    ];

    return Array.from(
      new Map(stocks.map((stock) => [stock.ticker, stock])).values(),
    );
  }, [trends]);

  const suggestions = useMemo(() => {
    const query = searchInput.trim().toUpperCase();

    if (!query) return [];

    return searchableStocks
      .filter((stock) => stock.ticker.toUpperCase().includes(query))
      .slice(0, 6);
  }, [searchInput, searchableStocks]);

  function lookupStock(symbol: string) {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) return;

    setSearchInput(normalizedSymbol);
    setShowSuggestions(false);
    dispatch(fetchQuote(normalizedSymbol));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    lookupStock(searchInput);
  }

  async function handleAddToWatchlist() {
    if (!quote?.symbol) return;

    await dispatch(addToWatchlist(quote.symbol));
    dispatch(fetchWatchlist());
  }

  function isInWatchlist(symbol: string) {
    return watchlist.some((item) => item.symbol === symbol);
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-[#0B1526] px-4 py-4 text-slate-50">
      <div className="mx-auto flex h-full max-w-[1640px] flex-col">
        {/* HEADER */}
        <div className="mb-1 shrink-0">
          <h1 className="text-2xl font-bold">Market Watch 👀</h1>

          <p className="mt-1 text-sm text-slate-400">
            Explore market trends, search stocks, and manage your watchlist.
          </p>
        </div>

        {/* TOP ROW */}
        <div className="grid min-h-0 flex=[.56] gap-4 lg:grid-cols-[2fr_1fr]">
          {/* MARKET TRENDS */}
          <section className="mt-4 min-h-0 flex-[0.44] overflow-hidden rounded-xl border border-[#24354D] bg-[#101C31] p-4">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">📈 Market Trends</h2>

                <p className="mt-1 text-sm text-slate-400">
                  Top gainers and losers by percentage change.
                </p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(fetchTrends())}
                disabled={status === "loading"}
                className="cursor-pointer rounded-md bg-[#3DD6F5] px-4 py-2 text-sm font-medium text-[#0B1526] transition hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

            {status === "loading" && chartData.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center text-slate-400">
                Loading market trends...
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[75%] min-h-[150px] rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 8,
                      right: 16,
                      left: 0,
                      bottom: 30,
                    }}
                  >
                    <XAxis
                      dataKey="ticker"
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      fontSize={12}
                      tick={{ fill: "#EEF0F8" }}
                    />

                    <YAxis
                      tickFormatter={(value) => `${value}%`}
                      fontSize={12}
                      tick={{ fill: "#EEF0F8" }}
                    />

                    <Tooltip
                      formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`}
                    />

                    <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`${entry.ticker}-${index}`}
                          fill={entry.type === "gainer" ? "#16a34a" : "#dc2626"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-700 px-6 text-center text-slate-400">
                No market trend data is available right now.
              </div>
            )}
          </section>

          {/* STOCK SEARCH + FINSIGHT INSIGHT */}
          <section className="flex h-full flex-col overflow-hidden rounded-xl border border-[#24354D] bg-[#101C31] p-4">
            {/* STOCK SEARCH */}
            <div>
              <h2 className="text-lg font-semibold">🔎 Stock Search</h2>

              <p className="mt-1 text-sm text-slate-400">
                Search by ticker or company name.
              </p>

              <form onSubmit={handleSearch} className="mt-3">
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      value={searchInput}
                      onChange={(event) => {
                        setSearchInput(event.target.value);
                        setShowSuggestions(true);
                        dispatch(clearQuote());
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="AAPL or Apple"
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-md border border-[#24354D] bg-[#0B1526] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-[#3DD6F5]"
                    />

                    <button
                      type="submit"
                      disabled={quoteStatus === "loading"}
                      className="cursor-pointer rounded-md bg-[#3DD6F5] px-4 py-2 text-sm font-medium text-[#0B1526] transition hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {quoteStatus === "loading" ? "Loading..." : "Search"}
                    </button>
                  </div>

                  {/* AUTOCOMPLETE */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-20 mt-2 max-h-48 overflow-y-auto rounded-lg border border-[#24354D] bg-[#0B1526] shadow-xl">
                      {suggestions.map((stock) => (
                        <button
                          key={stock.ticker}
                          type="button"
                          onMouseDown={() => lookupStock(stock.ticker)}
                          className="flex w-full items-center justify-between gap-4 border-b border-[#24354D] px-4 py-2 text-left last:border-b-0 hover:bg-[#14233A]"
                        >
                          <span className="font-semibold">{stock.ticker}</span>

                          <span className="text-sm text-slate-400">
                            {stock.change_percentage ?? ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {quoteError && (
                <p className="mt-3 text-sm text-red-400">{quoteError}</p>
              )}

              {/* QUOTE RESULT */}
              {quote ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-[#24354D] bg-[#0B1526]">
                  <div className="flex items-center justify-between gap-3 px-4 py-1">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl font-bold">
                          {quote.symbol}
                        </span>

                        <span className="text-lg font-semibold">
                          {quote.price ? `$${quote.price}` : "—"}
                        </span>
                      </div>

                      <div className="mt-1 flex gap-3 text-sm">
                        <span
                          className={
                            Number(quote.change) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {quote.change ?? "—"}
                        </span>

                        <span
                          className={
                            Number(quote.change_percent?.replace("%", "")) >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {quote.change_percent ?? "—"}
                        </span>
                      </div>
                    </div>

                    {!isInWatchlist(quote.symbol) && (
                      <button
                        type="button"
                        onClick={handleAddToWatchlist}
                        className="cursor-pointer shrink-0 rounded-md bg-[#3DD6F5] px-3 py-2 text-sm font-medium text-[#0B1526] transition hover:opacity-50"
                      >
                        + Watchlist
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-lg border border-dashed border-[#24354D] px-4 py-3 text-center text-sm text-slate-500">
                  Search for a stock to view its latest quote.
                </div>
              )}
            </div>

            {/* FINSIGHT INSIGHT */}
              <div className="mt-auto pt-3">
                {/* Logo + centered Title */}
                <div className="mb-3 flex items-center justify-center gap-3">
                  <img
                    src={logo}
                    alt="FinSight"
                    className="h-10 w-10 object-contain"
                  />

                  <h2 className="text-center text-[20px] font-semibold text-white">
                    FinSight™️ Insight:
                  </h2>
                </div>

              {quote ? (
                <div>
                  <p className="text-sm leading-5 text-slate-300">
                    <span className="font-semibold text-slate-50">
                      {quote.symbol}
                    </span>{" "}
                    is currently trading at{" "}
                    <span className="font-semibold text-[#3DD6F5]">
                      {quote.price ? `$${quote.price}` : "—"}
                    </span>
                    , with a daily move of{" "}
                    <span
                      className={
                        Number(quote.change) >= 0
                          ? "font-semibold text-green-400"
                          : "font-semibold text-red-400"
                      }
                    >
                      {quote.change_percent ?? "—"}
                    </span>
                    .
                  </p>

                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-slate-400">Volume:</span>{" "}
                      <span className="text-slate-200">
                        {quote.volume ?? "—"}
                      </span>
                    </div>

                    <Link
                      to="/chat"
                      className="-mt-1 rounded-md bg-[#3DD6F5] px-3 py-1.5 text-sm font-medium text-[#0B1526] transition hover:opacity-50"
                    >
                      Ask Fin →
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm leading-5 text-slate-300">
                    Search for a stock above and Fin will highlight its latest
                    market movement and key data.
                  </p>

                  <div className="mt-3 text-sm">
                    <span className="text-slate-400">Market:</span>{" "}
                    <span className="text-[#3DD6F5]">
                      Select a stock for insight
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* WATCHLIST */}
        <section className="mt-4 flex h-[264px] min-h-0 flex-col overflow-hidden rounded-xl border border-[#24354D] bg-[#101C31] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">⭐ Watchlist</h2>

              <p className="mt-1 text-sm text-slate-400">
                Stocks you are currently tracking.
              </p>
            </div>

            <span className="rounded bg-[#6C63FF] px-3 py-1 text-sm font-medium">
              {watchlist.length} Stocks
            </span>
          </div>

          {watchlistError && (
            <p className="mt-3 text-sm text-red-400">{watchlistError}</p>
          )}

          {watchlistStatus === "loading" && watchlist.length === 0 ? (
            <p className="mt-4 text-slate-400">Loading watchlist...</p>
          ) : watchlist.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-700 px-4 py-5 text-center text-slate-500">
              Your watchlist is empty. Search for a stock above to add one.
            </div>
          ) : (
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {watchlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-[#24354D] bg-[#0B1526] px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => lookupStock(item.symbol)}
                      className="text-left"
                    >
                      <span className="font-semibold">{item.symbol}</span>

                      <span className="mt-0.5 block text-xs text-slate-500">
                        View quote
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await dispatch(removeFromWatchlist(item.symbol));

                        dispatch(fetchWatchlist());
                      }}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
