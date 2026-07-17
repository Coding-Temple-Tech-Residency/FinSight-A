import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchProfile, saveProfile } from "../features/profile/profileSlice";

const AI_INTERVAL_OPTIONS = [
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "15 minutes", value: 900 },
  { label: "30 minutes", value: 1800 },
];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, status, error } = useAppSelector((state) => state.profile);

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isDayTrader, setIsDayTrader] = useState(false);
  const [aiInterval, setAiInterval] = useState(300);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setTheme(profile.theme as "light" | "dark" | "system");
      setIsDayTrader(profile.is_day_trader);
      setAiInterval(profile.ai_refresh_interval_seconds);
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const result = await dispatch(
      saveProfile({
        theme,
        is_day_trader: isDayTrader,
        ai_refresh_interval_seconds: aiInterval,
      })
    );
    if (saveProfile.fulfilled.match(result)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Profile</h1>

      {profile && (
        <section style={{ marginBottom: "1.5rem" }}>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        </section>
      )}

      <form onSubmit={handleSave}>
        <h2>Preferences</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="theme" style={{ display: "block", marginBottom: "0.25rem" }}>
            Theme
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
            style={{ padding: "0.4rem", fontSize: "1rem" }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            id="dayTrader"
            type="checkbox"
            checked={isDayTrader}
            onChange={(e) => setIsDayTrader(e.target.checked)}
          />
          <label htmlFor="dayTrader">Day Trader mode</label>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="aiInterval" style={{ display: "block", marginBottom: "0.25rem" }}>
            AI refresh interval
          </label>
          <select
            id="aiInterval"
            value={aiInterval}
            onChange={(e) => setAiInterval(Number(e.target.value))}
            style={{ padding: "0.4rem", fontSize: "1rem" }}
          >
            {AI_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {saved && <p style={{ color: "green" }}>Settings saved.</p>}

        <button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save preferences"}
        </button>
      </form>

      <section style={{ marginTop: "2rem" }}>
        <h2>Account</h2>
        <button type="button">Change Password</button>
      </section>
    </div>
  );
}
