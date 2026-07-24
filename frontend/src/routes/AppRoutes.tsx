import { Routes, Route } from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import RegistrationPage from "../pages/RegistrationPage";
import PortfolioPage from "../pages/PortfolioPage";
import ProtectedRoute from "./ProtectedRoute";
import MarketWatchPage from "../pages/MarketWatchPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegistrationPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/market-trends" element={<MarketWatchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/watchlist" element={<MarketWatchPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
      </Route>
    </Routes>
  );
}