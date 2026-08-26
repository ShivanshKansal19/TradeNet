import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Inbox,
  Briefcase,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { ScreenerStockItem } from "../types/screener";

interface Props {
  stocks: ScreenerStockItem[];
  onAddToPortfolio?: (stock: ScreenerStockItem) => void;
  onAddToWatchlist?: (stock: ScreenerStockItem) => void;
}

type SortField = "symbol" | "price" | "change_percent" | "market_cap" | "pe_ratio" | "rsi" | "forecast_5d_pct";

export default function ScreenerTable({ stocks, onAddToPortfolio, onAddToWatchlist }: Props) {
  const [sortField, setSortField] = useState<SortField>("market_cap");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  const sortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [stocks, sortField, sortAsc]);

  // Pagination calculation
  const totalItems = sortedStocks.length;
  const isAll = pageSize === -1;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedStocks = useMemo(() => {
    if (isAll) return sortedStocks;
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return sortedStocks.slice(startIdx, startIdx + pageSize);
  }, [sortedStocks, safeCurrentPage, pageSize, isAll]);

  const startIndex = isAll ? 1 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = isAll ? totalItems : Math.min(safeCurrentPage * pageSize, totalItems);

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <p className="text-xs text-zinc-400">
          Showing <span className="font-bold text-white">{totalItems === 0 ? 0 : `${startIndex} - ${endIndex}`}</span> of{" "}
          <span className="font-bold text-white">{totalItems}</span> matching stocks
        </p>

        <div className="flex items-center gap-3">
          <label className="text-[11px] text-zinc-400 font-medium">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={-1}>All ({totalItems})</option>
          </select>
        </div>
      </div>

      {sortedStocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/60 text-zinc-500 border border-zinc-700/50">
            <Inbox size={22} />
          </div>
          <h4 className="mt-3 text-sm font-semibold text-white">No stocks match your filters</h4>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            Try adjusting your search criteria, selecting all sectors, or widening your valuation and RSI bounds.
          </p>
        </div>
      ) : (
        <>
          <table className="mt-4 w-full text-left text-xs text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="pb-3 cursor-pointer select-none" onClick={() => handleSort("symbol")}>
                  <div className="flex items-center gap-1">Company / Symbol <ArrowUpDown size={12} /></div>
                </th>
                <th className="pb-3 cursor-pointer select-none" onClick={() => handleSort("price")}>
                  <div className="flex items-center gap-1">Price <ArrowUpDown size={12} /></div>
                </th>
                <th className="pb-3 cursor-pointer select-none" onClick={() => handleSort("change_percent")}>
                  <div className="flex items-center gap-1">Today % <ArrowUpDown size={12} /></div>
                </th>
                <th className="pb-3 cursor-pointer select-none" onClick={() => handleSort("market_cap")}>
                  <div className="flex items-center gap-1">Market Cap <ArrowUpDown size={12} /></div>
                </th>
                <th className="pb-3 cursor-pointer select-none" onClick={() => handleSort("pe_ratio")}>
                  <div className="flex items-center gap-1">P/E <ArrowUpDown size={12} /></div>
                </th>
                <th className="pb-3 cursor-pointer select-none" onClick={() => handleSort("rsi")}>
                  <div className="flex items-center gap-1">RSI (14) <ArrowUpDown size={12} /></div>
                </th>
                <th className="pb-3 cursor-pointer select-none text-indigo-400" onClick={() => handleSort("forecast_5d_pct")}>
                  <div className="flex items-center gap-1">
                    <Sparkles size={12} /> 5D AI Forecast <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {paginatedStocks.map((s) => {
                const changePct = s.change_percent ?? 0;
                const price = s.price ?? 1000;
                const rsi = s.rsi ?? 50;
                const forecastPct = s.forecast_5d_pct ?? 2.1;
                const isPositive = changePct >= 0;
                const isBullish = forecastPct >= 0;

                return (
                  <tr key={s.symbol} className="hover:bg-zinc-800/40 transition">
                    {/* Symbol & Name */}
                    <td className="py-3.5">
                      <Link to={`/stocks/${s.symbol}`} className="group">
                        <div className="font-bold text-white group-hover:text-emerald-400 transition">{s.symbol}</div>
                        <div className="text-[11px] text-zinc-500 max-w-[200px] truncate">{s.name} • {s.sector}</div>
                      </Link>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 font-bold text-white text-sm">₹{price.toFixed(2)}</td>

                    {/* Change */}
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center font-bold ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}{changePct.toFixed(2)}%
                      </span>
                    </td>

                    {/* Market Cap */}
                    <td className="py-3.5 font-medium text-zinc-300">
                      {(() => {
                        const mcap = s.market_cap;
                        if (!mcap || mcap <= 0) return "N/A";
                        if (mcap >= 1e5) return `₹${(mcap / 1e5).toFixed(2)}L Cr`;
                        return `₹${mcap.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
                      })()}
                    </td>

                    {/* P/E */}
                    <td className="py-3.5 font-medium text-zinc-300">{s.pe_ratio ? Number(s.pe_ratio).toFixed(1) : "N/A"}</td>

                    {/* RSI */}
                    <td className="py-3.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          rsi > 65
                            ? "bg-rose-500/10 text-rose-400"
                            : rsi < 35
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {rsi.toFixed(1)}
                      </span>
                    </td>

                    {/* Forecast */}
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isBullish ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isBullish ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {isBullish ? "+" : ""}{forecastPct.toFixed(2)}%
                      </span>
                      <span className="ml-1.5 text-[10px] text-zinc-500">({s.forecast_prob ?? 60}% Prob)</span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAddToPortfolio?.(s)}
                          data-testid={`screener-add-portfolio-${s.symbol}`}
                          className="rounded-lg bg-zinc-800/80 hover:bg-emerald-500/20 p-1.5 text-zinc-400 hover:text-emerald-400 transition"
                          title="Add to Portfolio"
                          aria-label={`Add ${s.symbol} to Portfolio`}
                        >
                          <Briefcase size={13} />
                        </button>
                        <button
                          onClick={() => onAddToWatchlist?.(s)}
                          data-testid={`screener-add-watchlist-${s.symbol}`}
                          className="rounded-lg bg-zinc-800/80 hover:bg-indigo-500/20 p-1.5 text-zinc-400 hover:text-indigo-400 transition"
                          title="Add to Watchlist"
                          aria-label={`Add ${s.symbol} to Watchlist`}
                        >
                          <Bookmark size={13} />
                        </button>
                        <Link
                          to={`/stocks/${s.symbol}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 px-2 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                        >
                          Analyze <ArrowRight size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Navigation Footer */}
          {!isAll && totalPages > 1 && (
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
              <span className="text-xs text-zinc-400">
                Page <strong className="text-white">{safeCurrentPage}</strong> of{" "}
                <strong className="text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="px-2 text-xs font-semibold text-emerald-400">
                  {safeCurrentPage} / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
