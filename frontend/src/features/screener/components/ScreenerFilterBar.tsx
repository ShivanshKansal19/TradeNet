import { Search, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import type { ScreenerFilters, MarketCapCategory, PeCategory, PricePerformance, ForecastTrend } from "../types/screener";

interface Props {
  filters: ScreenerFilters;
  onChange: (filters: ScreenerFilters) => void;
  onReset: () => void;
  availableSectors?: string[];
  totalResultsCount: number;
}

const DEFAULT_SECTORS = [
  "all",
  "Automobile",
  "Capital Goods",
  "Construction",
  "Consumer Goods",
  "Consumer Services",
  "Energy",
  "Financial Services",
  "Healthcare",
  "Materials",
  "Metals & Mining",
  "Services",
  "Technology",
  "Telecommunication",
];

export default function ScreenerFilterBar({
  filters,
  onChange,
  onReset,
  availableSectors = DEFAULT_SECTORS,
  totalResultsCount,
}: Props) {
  // Count active non-default filters
  const activeCount = [
    filters.search !== "",
    filters.sector !== "all",
    filters.marketCapCategory !== "all",
    filters.peCategory !== "all",
    filters.pricePerformance !== "all",
    filters.forecastTrend !== "all",
    filters.minForecastProb > 0,
    filters.minRsi > 0 || filters.maxRsi < 100,
  ].filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <SlidersHorizontal size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Stock Screener Filters</h3>
              {activeCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {activeCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">Filter across technicals, fundamentals, market cap, and AI forecasts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">
            Matching: <strong className="text-white">{totalResultsCount}</strong> stocks
          </span>
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-white transition"
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Filter Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Search Symbol / Name</label>
          <div className="relative mt-1.5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="e.g. RELIANCE, TCS, Tata..."
              className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
            />
          </div>
        </div>

        {/* Sector */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Sector</label>
          <select
            value={filters.sector}
            onChange={(e) => onChange({ ...filters, sector: e.target.value })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition cursor-pointer"
          >
            {availableSectors.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Sectors" : s}
              </option>
            ))}
          </select>
        </div>

        {/* Market Cap Tier */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Market Cap Tier</label>
          <select
            value={filters.marketCapCategory}
            onChange={(e) => onChange({ ...filters, marketCapCategory: e.target.value as MarketCapCategory })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition cursor-pointer"
          >
            <option value="all">All Market Caps</option>
            <option value="large">Large Cap (&gt;₹20k Cr)</option>
            <option value="mid">Mid Cap (₹5k - ₹20k Cr)</option>
            <option value="small">Small Cap (&lt;₹5k Cr)</option>
          </select>
        </div>

        {/* Valuation / P/E Ratio */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Valuation (P/E Ratio)</label>
          <select
            value={filters.peCategory}
            onChange={(e) => onChange({ ...filters, peCategory: e.target.value as PeCategory })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition cursor-pointer"
          >
            <option value="all">All Valuations</option>
            <option value="value">Value (&le;15 P/E)</option>
            <option value="fair">Moderate (15 - 30 P/E)</option>
            <option value="growth">Growth (&gt;30 P/E)</option>
          </select>
        </div>

        {/* Today's Price Performance */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Price Performance</label>
          <select
            value={filters.pricePerformance}
            onChange={(e) => onChange({ ...filters, pricePerformance: e.target.value as PricePerformance })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition cursor-pointer"
          >
            <option value="all">All Movements</option>
            <option value="gainers">Top Gainers (+ve)</option>
            <option value="big_gainers">Big Movers (&gt;+2%)</option>
            <option value="losers">Top Losers (-ve)</option>
          </select>
        </div>

        {/* AI Forecast Trend */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-indigo-400" /> AI Forecast Trend
          </label>
          <select
            value={filters.forecastTrend}
            onChange={(e) => onChange({ ...filters, forecastTrend: e.target.value as ForecastTrend })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition cursor-pointer"
          >
            <option value="all">All Directions</option>
            <option value="bullish">Bullish (+ Expected Return)</option>
            <option value="bearish">Bearish (- Expected Return)</option>
          </select>
        </div>

        {/* AI Min Forecast Confidence */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Min AI Confidence</label>
          <select
            value={filters.minForecastProb}
            onChange={(e) => onChange({ ...filters, minForecastProb: Number(e.target.value) })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition cursor-pointer"
          >
            <option value={0}>Any Confidence</option>
            <option value={55}>&gt;55% Probability</option>
            <option value={60}>&gt;60% Probability</option>
            <option value={70}>&gt;70% High Confidence</option>
          </select>
        </div>

        {/* RSI Range presets */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            RSI Filter ({filters.minRsi} - {filters.maxRsi})
          </label>
          <div className="mt-1.5 flex items-center gap-1.5">
            <button
              onClick={() => {
                if (filters.maxRsi === 35) {
                  onChange({ ...filters, minRsi: 0, maxRsi: 100 });
                } else {
                  onChange({ ...filters, minRsi: 0, maxRsi: 35 });
                }
              }}
              className={`flex-1 rounded-xl py-2 text-[11px] font-semibold border transition ${
                filters.maxRsi === 35
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Oversold (&lt;35)
            </button>
            <button
              onClick={() => {
                if (filters.minRsi === 65) {
                  onChange({ ...filters, minRsi: 0, maxRsi: 100 });
                } else {
                  onChange({ ...filters, minRsi: 65, maxRsi: 100 });
                }
              }}
              className={`flex-1 rounded-xl py-2 text-[11px] font-semibold border transition ${
                filters.minRsi === 65
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                  : "bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Overbought (&gt;65)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
