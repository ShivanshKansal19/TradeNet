import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useStockDetails, useStockTechnicals, StockHeader, StockFundamentalsCard, StockTechnicalsCard } from "../features/stocks";
import { ForecastCard } from "../features/forecasts";
import InteractiveStockChart from "../components/charts/InteractiveStockChart";

export default function StockDetailPage() {
  const { symbol = "RELIANCE" } = useParams<{ symbol: string }>();
  const sym = symbol.toUpperCase();

  const { data: stock, isLoading: isStockLoading } = useStockDetails(sym);
  const { data: technicals } = useStockTechnicals(sym);

  if (isStockLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
        <p className="text-zinc-400">Stock {sym} not found in database.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-xs font-semibold text-emerald-400 hover:underline">
          Return to Market Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Stock Ticker Header */}
      <StockHeader stock={stock} />

      {/* Interactive Price Chart */}
      <InteractiveStockChart symbol={stock.symbol} />

      {/* AI / ML Walk-Forward Forecast Card */}
      <ForecastCard symbol={stock.symbol} currentPrice={stock.price} />

      {/* 2-Column Technicals & Fundamentals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockTechnicalsCard technicals={technicals} />
        <StockFundamentalsCard stock={stock} />
      </div>
    </div>
  );
}
