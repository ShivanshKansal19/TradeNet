import React, { useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, Target, ShieldCheck } from "lucide-react";
import type { HorizonDays } from "../types/forecast";
import { useStockForecast } from "../hooks/useStockForecast";
import ValidationScoreBadge from "./ValidationScoreBadge";
import ForecastDisclaimer from "./ForecastDisclaimer";

interface Props {
  symbol: string;
  currentPrice: number;
}

export default function ForecastCard({ symbol, currentPrice }: Props) {
  const [horizon, setHorizon] = useState<HorizonDays>(5);
  const { data: forecast, isLoading } = useStockForecast(symbol, horizon, currentPrice);

  const horizons: { label: string; value: HorizonDays }[] = [
    { label: "1 Trading Day", value: 1 },
    { label: "5 Trading Days", value: 5 },
    { label: "20 Trading Days", value: 20 },
  ];

  const isBullish = (forecast?.expected_return_pct || 0) >= 0;

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-indigo-950/30 p-6 shadow-2xl backdrop-blur-md">
      {/* Header with AI Badge & Horizon Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Sparkles size={19} />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Walk-Forward AI Forecast
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                PROPHET ML
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Multi-horizon probabilistic return models</p>
          </div>
        </div>

        {/* Horizon Tabs */}
        <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-800">
          {horizons.map((h) => (
            <button
              key={h.value}
              onClick={() => setHorizon(h.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                horizon === h.value
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Forecast Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Expected Direction & Target */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <span className="text-xs font-medium text-zinc-400">Target Expectation</span>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-white">
              ₹{(forecast?.expected_target_price || currentPrice).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span
              className={`inline-flex items-center text-xs font-bold ${
                isBullish ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isBullish ? <TrendingUp size={13} className="mr-0.5" /> : <TrendingDown size={13} className="mr-0.5" />}
              {isBullish ? "+" : ""}{forecast?.expected_return_pct.toFixed(2)}%
            </span>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            Expected {horizon}-day horizon price target
          </p>
        </div>

        {/* Probability of Positive Return */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Positive Return Probability</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {forecast?.confidence_label || "High"} Confidence
            </span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-400">
            {forecast?.probability_positive || 64}%
          </p>
          <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-full"
              style={{ width: `${forecast?.probability_positive || 64}%` }}
            />
          </div>
        </div>

        {/* Confidence Interval Spread */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <span className="text-xs font-medium text-zinc-400">80% Confidence Interval</span>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-zinc-500">Lower Bound</p>
              <p className="text-sm font-bold text-rose-400">₹{forecast?.lower_bound_price.toFixed(2)}</p>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="text-right">
              <p className="text-[11px] text-zinc-500">Upper Bound</p>
              <p className="text-sm font-bold text-emerald-400">₹{forecast?.upper_bound_price.toFixed(2)}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-400">Statistically modeled price volatility range</p>
        </div>
      </div>

      {/* Backtesting Validation Score */}
      {forecast?.validation && (
        <div className="mt-5">
          <ValidationScoreBadge validation={forecast.validation} />
        </div>
      )}

      {/* Compliance Disclaimer */}
      <div className="mt-5">
        <ForecastDisclaimer />
      </div>
    </div>
  );
}
