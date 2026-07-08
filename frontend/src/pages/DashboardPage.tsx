import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";
import { fetchWatchlist } from "../features/watchlist/watchlistSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.watchlist);
  const preview = items.slice(0, 5);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Dashboard</h1>

      <section style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Watchlist</h2>
          <Link to="/watchlist">View all</Link>
        </div>

        {status === "loading" && <p>Loading...</p>}

        {status !== "loading" && preview.length === 0 && (
          <p>
            No items yet. <Link to="/watchlist">Add a symbol.</Link>
          </p>
        )}

        {preview.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem" }}>
            {preview.map((item) => (
              <li
                key={item.id}
                style={{ padding: "0.4rem 0", borderBottom: "1px solid #eee", fontWeight: 600 }}
              >
                {item.symbol}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
