import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../features/watchlist/watchlistSlice";

export default function WatchlistPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.watchlist);
  const [input, setInput] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const symbol = input.trim().toUpperCase();
    if (!symbol) return;
    setAddError(null);
    const result = await dispatch(addToWatchlist(symbol));
    if (addToWatchlist.rejected.match(result)) {
      setAddError(result.error.message ?? "Failed to add symbol");
    } else {
      setInput("");
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Watchlist</h1>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ticker symbol (e.g. AAPL)"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-base focus:outline-none focuse:ring-2 focus:ring-cyan-500"
        />
        <button type="submit" disabled={status === "loading"}
        className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Add
        </button>
      </form>

      {addError && <p className="text-red-600 mb-4">{addError}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {status === "loading" && items.length === 0 && <p className="text-slate-500">Loading...</p>}

      {items.length === 0 && status !== "loading" ? (
        <p className="text-slate-500">Your watchlist is empty. Add a ticker above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              className="fles justify-between items-center px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              <span className="font-semibold text-slate-900">{item.symbol}</span>
              <button
                onClick={() => dispatch(removeFromWatchlist(item.symbol))}
                className="text-red-600 hover:text-red-800 font-medium bg-transparent border-none cursor-pointer"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
