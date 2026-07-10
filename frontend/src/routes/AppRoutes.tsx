import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import MarketTrendsPage from "../pages/MarketTrendsPage";
import ProfilePage from "../pages/ProfilePage";
import WatchlistPage from "../pages/WatchlistPage";
import RegistrationPage from "../pages/RegistrationPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegistrationPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/market-trends" element={<MarketTrendsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/watchlist" element={<WatchlistPage />} />
    </Routes>
  );
}