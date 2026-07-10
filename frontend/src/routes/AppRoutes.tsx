import { Routes, Route } from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import DashboardPage from "../pages/DashboardPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import MarketTrendsPage from "../pages/MarketTrendsPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";
import WatchlistPage from "../pages/WatchlistPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/market-trends" element={<MarketTrendsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/watchlist" element={<WatchlistPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  );
}