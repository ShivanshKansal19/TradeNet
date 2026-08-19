import React, { useState, useMemo } from "react";
import { ListFilter } from "lucide-react";
import {
  ScreenerFilterBar,
  ScreenerTable,
  filterScreenerStocks,
  MOCK_SCREENER_STOCKS,
  type ScreenerFilters,
} from "../features/screener";

const INITIAL_FILTERS: ScreenerFilters = {
  sector: "all",
  minMarketCap: 0,
  minRsi: 0,
  maxRsi: 100,
  forecastTrend: "all",
  search: "",
};

export default function ScreenerPage() {
  const [filters, setFilters] = useState<ScreenerFilters>(INITIAL_FILTERS);

  const filteredStocks = useMemo(() => {
    return filterScreenerStocks(MOCK_SCREENER_STOCKS, filters);
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ListFilter size={18} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Stock Screener</h1>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Filter Indian equities by technical momentum, valuation ratios, and short-horizon AI forecast signals
        </p>
      </div>

      {/* Filter Bar */}
      <ScreenerFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      {/* Filtered Results Table */}
      <ScreenerTable stocks={filteredStocks} />
    </div>
  );
}
