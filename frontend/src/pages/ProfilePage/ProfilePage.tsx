//FinSight-A/frontend/src/pages/ProfilePage/ProfilePage.tsx

import Profile from "../../components/Profile/Profile";
import { Profile as ProfileType } from "../../types/profile";

export default function ProfilePage() {
  const profile: ProfileType = {
    id: "",
    email: "user@example.com",
    avatarUrl: "",
    theme: "system",
    isDayTrader: false,
    createdAt: "",
    updatedAt: "",
  };

  return (
    <div>
      <h1>Profile</h1>

      <Profile profile={profile} />

      <section>
        <h2>Preferences</h2>

        <div>
          <label htmlFor="theme">Theme</label>

          <select id="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div>
          <label htmlFor="dayTrader">Day Trader</label>

          <input id="dayTrader" type="checkbox" />
        </div>
      </section>

      <section>
        <h2>Account</h2>

        <button type="button">Change Password</button>
      </section>
    </div>
  );
}
