import React from "react";
import { Link } from "react-router-dom";
import { Plus, GitCompare, Bookmark, TrendingUp, TrendingDown } from "lucide-react";
import type { Stock } from "../types/stock";

interface Props {
  stock: Stock;
  onAddToWatchlist?: () => void;
}

export default function StockHeader({ stock, onAddToWatchlist }: Props) {
  const price = stock.price ?? 0;
  const change = stock.change ?? 0;
  const changePercent = stock.change_percent ?? 0;
  const yearLow = stock.year_low ?? (price * 0.75);
  const yearHigh = stock.year_high ?? (price * 1.25);
  const isPositive = change >= 0;

  // Calculate 52-week range position %
  const rangeSpan = yearHigh - yearLow || 1;
  const currentPos = Math.min(100, Math.max(0, ((price - yearLow) / rangeSpan) * 100));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Ticker Info */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{stock.symbol}</h1>
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
              NSE:{stock.series || "EQ"}
            </span>
            {stock.sector && (
              <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                {stock.sector}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-400">{stock.name} • ISIN: {stock.isin_number || `INE000${stock.symbol}01`}</p>
        </div>

        {/* Right Price & Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight text-white">
              ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 text-sm font-semibold ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {isPositive ? "+" : ""}
                {change.toFixed(2)} ({isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onAddToWatchlist}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-2 text-xs font-semibold transition"
            >
              <Bookmark size={14} />
              Watchlist
            </button>
            <Link
              to={`/compare?stock1=${stock.symbol}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-semibold transition shadow-sm"
            >
              <GitCompare size={14} />
              Compare
            </Link>
          </div>
        </div>
      </div>

      {/* 52-Week Range Bar */}
      <div className="mt-6 border-t border-zinc-800/80 pt-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>52W Low: ₹{yearLow.toFixed(2)}</span>
          <span className="font-semibold text-zinc-200">52-Week Price Range</span>
          <span>52W High: ₹{yearHigh.toFixed(2)}</span>
        </div>
        <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            style={{ width: `${currentPos}%` }}
          />
        </div>
      </div>
    </div>
  );
}
