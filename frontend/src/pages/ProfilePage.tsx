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
    <div className="mx-auto mt-8 max-w-2xl px-4">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Profile</h1>

      {profile && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Account Information</h2>
          <div className="space-y-2 text-slate-700">
          <p><span className="font-semibold">Email:</span> {profile.email}</p>
          <p><span className="font-semibold">Member since:</span> {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </section>
      )}

      <form onSubmit={handleSave}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">Preferences</h2>

        <div className="mb-5">
          <label htmlFor="theme" className="mb-2 block font-medium text-slate-700">
            Theme
          </label>
          <select
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <input
            id="dayTrader"
            type="checkbox"
            checked={isDayTrader}
            onChange={(e) => setIsDayTrader(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="dayTrader" className="font-medium text-slate-700">Day Trader mode</label>
        </div>

        <div className="mb-6">
          <label htmlFor="aiInterval" className="mb-2 block font-medium text-slate-700">
            AI refresh interval
          </label>
          <select
            id="aiInterval"
            value={aiInterval}
            onChange={(e) => setAiInterval(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {AI_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mb-4 text-red-500">{error}</p>}
        {saved && <p className="mb-4 text-green-500">Settings saved.</p>}

        <button type="submit" disabled={status === "saving"}
        className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          {status === "saving" ? "Saving..." : "Save preferences"}
        </button>
      </form>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Account</h2>
        <button type="button"
        className="rounded-lg border border-slate-300 px-5 py-2 font-medium transition hover:bg-slate-100">
          Change Password</button>
      </section>
    </div>
  );
}
