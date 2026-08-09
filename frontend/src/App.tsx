import { Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import Compare from "./pages/Compare";
import Screener from "./pages/Screener";
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stocks/:symbol" element={<StockDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/screener" element={<Screener />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Route>
    </Routes>
  );
}
