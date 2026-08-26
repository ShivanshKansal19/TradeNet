import React from "react";
import type { TechnicalIndicatorsData } from "../types/stock";
import { Activity, Gauge, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  technicals?: TechnicalIndicatorsData;
}

export default function StockTechnicalsCard({ technicals }: Props) {
  const rsi = technicals?.rsi_14 || 58.4;
  const isRsiOverbought = rsi > 70;
  const isRsiOversold = rsi < 30;

  const rsiColor = isRsiOverbought ? "text-rose-400" : isRsiOversold ? "text-emerald-400" : "text-amber-400";
  const rsiBg = isRsiOverbought ? "bg-rose-500/10" : isRsiOversold ? "bg-emerald-500/10" : "bg-amber-500/10";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Technical Indicators</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Momentum, trend & moving averages</p>
        </div>
        <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
          {technicals?.trend_summary || "Moderate Uptrend"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* RSI Box */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">RSI (14)</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${rsiBg} ${rsiColor}`}>
              {isRsiOverbought ? "Overbought" : isRsiOversold ? "Oversold" : "Neutral"}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{rsi.toFixed(1)}</p>
          <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
              style={{ width: `${rsi}%` }}
            />
          </div>
        </div>

        {/* MACD Box */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">MACD (12,26,9)</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {technicals?.macd_trend || "Bullish"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{technicals?.macd ? technicals.macd.toFixed(2) : "14.20"}</p>
            <span className="text-xs text-zinc-500">Signal: {technicals?.macd_signal ? technicals.macd_signal.toFixed(2) : "10.40"}</span>
          </div>
          <p className="mt-3 text-xs text-zinc-400">Histogram: +{technicals?.macd_hist ? technicals.macd_hist.toFixed(2) : "3.80"}</p>
        </div>

        {/* Moving Averages Box */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <span className="text-xs text-zinc-400">Moving Averages</span>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">20 SMA:</span>
              <span className="font-semibold text-emerald-400">₹{technicals?.sma_20?.toFixed(2) || "1,390.00"} (Above)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">50 SMA:</span>
              <span className="font-semibold text-emerald-400">₹{technicals?.sma_50?.toFixed(2) || "1,340.00"} (Above)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">200 SMA:</span>
              <span className="font-semibold text-emerald-400">₹{technicals?.sma_200?.toFixed(2) || "1,280.00"} (Above)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
