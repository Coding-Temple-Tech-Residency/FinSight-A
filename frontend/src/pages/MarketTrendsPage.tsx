import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTrends, fetchQuote, clearQuote } from "../features/market/marketSlice";

export default function MarketTrendsPage() {
  const dispatch = useAppDispatch();
  const { trends, quote, status, quoteStatus, error, quoteError } =
    useAppSelector((state) => state.market);
  const [symbolInput, setSymbolInput] = useState("");

  useEffect(() => {
    dispatch(fetchTrends());
  }, [dispatch]);

  function handleQuoteLookup(e: React.FormEvent) {
    e.preventDefault();
    const sym = symbolInput.trim();
    if (!sym) return;
    dispatch(fetchQuote(sym));
  }

  const chartData = [
    ...(trends?.top_gainers ?? []).slice(0, 5).map((m) => ({
      ticker: m.ticker,
      change: parseFloat(m.change_percentage?.replace("%", "") ?? "0"),
      type: "gainer",
    })),
    ...(trends?.top_losers ?? []).slice(0, 5).map((m) => ({
      ticker: m.ticker,
      change: parseFloat(m.change_percentage?.replace("%", "") ?? "0"),
      type: "loser",
    })),
  ];

  return (
    <div className="mx-auto mt-8 max-w-3xl px-4">
      <h1>Market Trends</h1>

      {status === "loading" && (
        <p
        className="text-slate-50">Loading trends...</p>)}
      {error && (
      <p className="text-red-500">{error}</p>)}

      {chartData.length > 0 && (
        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Top Movers (% change)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <XAxis dataKey="ticker" angle={-35} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.type === "gainer" ? "#16a34a" : "#dc2626"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {status === "idle" && chartData.length === 0 && (
        <p className="text-slate-50">No trend data available. The market may be closed or the API key is not set.</p>
      )}

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Quote Lookup</h2>
        <form onSubmit={handleQuoteLookup} className="mb-4 flex gap-2">
          <input
            value={symbolInput}
            onChange={(e) => {
              setSymbolInput(e.target.value);
              dispatch(clearQuote());
            }}
            placeholder="Ticker symbol (e.g. AAPL)"
            className="flex-1 rounded-md border border-slate-100 px-3 py-2 text-base focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
          <button type="submit" disabled={quoteStatus === "loading"}
          className="round-md big-indigo-400 px-4 py-2 font-medium text-slate-50 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
            {quoteStatus === "loading" ? "Loading..." : "Look up"}
          </button>
        </form>

        {quoteError && <p className="mb-4 text-red-500">{quoteError}</p>}

        {quote && (
          <table className="w-full border-collapse">
            <tbody>
              {[
                ["Symbol", quote.symbol],
                ["Price", quote.price ? `$${quote.price}` : "—"],
                ["Change", quote.change ?? "—"],
                ["Change %", quote.change_percent ?? "—"],
                ["Volume", quote.volume ?? "—"],
                ["Last trading day", quote.latest_trading_day ?? "—"],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-slate-50">
                  <td className="w-2/5 py-2 pr-3 font-semibold">{label}</td>
                  <td className="py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
