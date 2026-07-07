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
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
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
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Market Trends</h1>

      {status === "loading" && <p>Loading trends...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {chartData.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Top Movers (% change)</h2>
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
        <p>No trend data available. The market may be closed or the API key is not set.</p>
      )}

      <section>
        <h2>Quote Lookup</h2>
        <form onSubmit={handleQuoteLookup} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            value={symbolInput}
            onChange={(e) => {
              setSymbolInput(e.target.value);
              dispatch(clearQuote());
            }}
            placeholder="Ticker symbol (e.g. AAPL)"
            style={{ flex: 1, padding: "0.4rem 0.75rem", fontSize: "1rem" }}
          />
          <button type="submit" disabled={quoteStatus === "loading"}>
            {quoteStatus === "loading" ? "Loading..." : "Look up"}
          </button>
        </form>

        {quoteError && <p style={{ color: "red" }}>{quoteError}</p>}

        {quote && (
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {[
                ["Symbol", quote.symbol],
                ["Price", quote.price ? `$${quote.price}` : "—"],
                ["Change", quote.change ?? "—"],
                ["Change %", quote.change_percent ?? "—"],
                ["Volume", quote.volume ?? "—"],
                ["Last trading day", quote.latest_trading_day ?? "—"],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.4rem 0.75rem 0.4rem 0", fontWeight: 600, width: "40%" }}>{label}</td>
                  <td style={{ padding: "0.4rem 0" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
