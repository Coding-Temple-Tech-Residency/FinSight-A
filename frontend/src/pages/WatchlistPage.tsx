import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
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
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Watchlist</h1>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ticker symbol (e.g. AAPL)"
          style={{ flex: 1, padding: "0.4rem 0.75rem", fontSize: "1rem" }}
        />
        <button type="submit" disabled={status === "loading"}>
          Add
        </button>
      </form>

      {addError && <p style={{ color: "red" }}>{addError}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {status === "loading" && items.length === 0 && <p>Loading...</p>}

      {items.length === 0 && status !== "loading" ? (
        <p>Your watchlist is empty. Add a ticker above.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span style={{ fontWeight: 600 }}>{item.symbol}</span>
              <button
                onClick={() => dispatch(removeFromWatchlist(item.symbol))}
                style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
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
