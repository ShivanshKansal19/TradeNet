import React from "react";
import { Filter, Search, RotateCcw } from "lucide-react";
import type { ScreenerFilters } from "../types/screener";

interface Props {
  filters: ScreenerFilters;
  onChange: (filters: ScreenerFilters) => void;
  onReset: () => void;
}

const SECTORS = ["all", "Banking", "Technology", "Energy", "Automobile", "FMCG"];

export default function ScreenerFilterBar({ filters, onChange, onReset }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">Stock Screener Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition self-start md:self-auto"
        >
          <RotateCcw size={13} />
          Reset Filters
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Search Symbol</label>
          <div className="relative mt-1.5">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="e.g. TCS, RELIANCE..."
              className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-9 pr-3 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Sector */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Sector</label>
          <select
            value={filters.sector}
            onChange={(e) => onChange({ ...filters, sector: e.target.value })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Sectors" : s}
              </option>
            ))}
          </select>
        </div>

        {/* Forecast Trend */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">AI Forecast Trend</label>
          <select
            value={filters.forecastTrend}
            onChange={(e) => onChange({ ...filters, forecastTrend: e.target.value as any })}
            className="mt-1.5 h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 text-xs text-white outline-none focus:border-emerald-500"
          >
            <option value="all">All Directions</option>
            <option value="bullish">Bullish (+ Expected Return)</option>
            <option value="bearish">Bearish (- Expected Return)</option>
          </select>
        </div>

        {/* RSI Range */}
        <div>
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            RSI Filter: {filters.minRsi} - {filters.maxRsi}
          </label>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => onChange({ ...filters, minRsi: 0, maxRsi: 35 })}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
                filters.maxRsi === 35
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Oversold (&lt;35)
            </button>
            <button
              onClick={() => onChange({ ...filters, minRsi: 65, maxRsi: 100 })}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
                filters.minRsi === 65
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
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
