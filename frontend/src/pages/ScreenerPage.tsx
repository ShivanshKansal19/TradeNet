import { useState, useEffect, useMemo } from "react";
import { ListFilter, Loader2, RefreshCw } from "lucide-react";
import {
  ScreenerFilterBar,
  ScreenerTable,
  filterScreenerStocks,
  fetchScreenerStocks,
  type ScreenerFilters,
  type ScreenerStockItem,
} from "../features/screener";

const INITIAL_FILTERS: ScreenerFilters = {
  search: "",
  sector: "all",
  marketCapCategory: "all",
  minMarketCap: 0,
  peCategory: "all",
  pricePerformance: "all",
  minRsi: 0,
  maxRsi: 100,
  forecastTrend: "all",
  minForecastProb: 0,
};

export default function ScreenerPage() {
  const [filters, setFilters] = useState<ScreenerFilters>(INITIAL_FILTERS);
  const [stocks, setStocks] = useState<ScreenerStockItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchScreenerStocks();
      setStocks(data);
    } catch (e) {
      console.error("Failed to load screener stocks:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  // Compute available unique sectors from stocks
  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => {
      if (s.sector && s.sector !== "Diversified") {
        set.add(s.sector);
      }
    });
    return ["all", ...Array.from(set).sort()];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return filterScreenerStocks(stocks, filters);
  }, [stocks, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ListFilter size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Stock Screener</h1>
            <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              {stocks.length} Stocks Universe
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Multi-factor screener across technical momentum, valuation ratios, and short-horizon AI forecast signals
          </p>
        </div>

        <button
          onClick={loadStocks}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Filter Bar */}
      <ScreenerFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
        availableSectors={availableSectors}
        totalResultsCount={filteredStocks.length}
      />

      {/* Filtered Results Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
          <p className="mt-3 text-xs text-zinc-400 font-medium">Loading stock universe and live indicators...</p>
        </div>
      ) : (
        <ScreenerTable stocks={filteredStocks} />
      )}
    </div>
  );
}
