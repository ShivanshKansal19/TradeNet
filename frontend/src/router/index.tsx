import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import StockDetailPage from "../pages/StockDetailPage";
import ComparePage from "../pages/ComparePage";
import ScreenerPage from "../pages/ScreenerPage";
import WatchlistPage from "../pages/WatchlistPage";
import PortfolioPage from "../pages/PortfolioPage";
import ProfilePage from "../pages/ProfilePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { RequireAuth } from "../features/auth";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/stocks/:symbol" element={<StockDetailPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="/screener" element={<ScreenerPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
