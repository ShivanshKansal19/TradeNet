import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, Sparkles, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { ScreenerStockItem } from "../types/screener";

interface Props {
  stocks: ScreenerStockItem[];
}

type SortField = "symbol" | "price" | "change_percent" | "market_cap" | "pe_ratio" | "rsi" | "forecast_5d_pct";

export default function ScreenerTable({ stocks }: Props) {
  const [sortField, setSortField] = useState<SortField>("market_cap");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <p className="text-xs text-zinc-400">
          Showing <span className="font-bold text-white">{sortedStocks.length}</span> matching stocks
        </p>
      </div>

      <table className="mt-4 w-full text-left text-xs text-zinc-300">
        <thead>
          <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <th className="pb-3 cursor-pointer" onClick={() => handleSort("symbol")}>
              <div className="flex items-center gap-1">Company / Symbol <ArrowUpDown size={12} /></div>
            </th>
            <th className="pb-3 cursor-pointer" onClick={() => handleSort("price")}>
              <div className="flex items-center gap-1">Price <ArrowUpDown size={12} /></div>
            </th>
            <th className="pb-3 cursor-pointer" onClick={() => handleSort("change_percent")}>
              <div className="flex items-center gap-1">Today % <ArrowUpDown size={12} /></div>
            </th>
            <th className="pb-3 cursor-pointer" onClick={() => handleSort("market_cap")}>
              <div className="flex items-center gap-1">Market Cap <ArrowUpDown size={12} /></div>
            </th>
            <th className="pb-3 cursor-pointer" onClick={() => handleSort("pe_ratio")}>
              <div className="flex items-center gap-1">P/E <ArrowUpDown size={12} /></div>
            </th>
            <th className="pb-3 cursor-pointer" onClick={() => handleSort("rsi")}>
              <div className="flex items-center gap-1">RSI (14) <ArrowUpDown size={12} /></div>
            </th>
            <th className="pb-3 cursor-pointer text-indigo-400" onClick={() => handleSort("forecast_5d_pct")}>
              <div className="flex items-center gap-1">
                <Sparkles size={12} /> 5D AI Forecast <ArrowUpDown size={12} />
              </div>
            </th>
            <th className="pb-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {sortedStocks.map((s) => {
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
                    <div className="text-[11px] text-zinc-500">{s.name} • {s.sector}</div>
                  </Link>
                </td>

                {/* Price */}
                <td className="py-3.5 font-bold text-white text-sm">₹{price.toFixed(2)}</td>

                {/* Change */}
                <td className="py-3.5">
                  <span
                    className={`inline-flex items-center font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                  >
                    {isPositive ? "+" : ""}{changePct.toFixed(2)}%
                  </span>
                </td>

                {/* Market Cap */}
                <td className="py-3.5 font-medium text-zinc-300">₹{((s.market_cap || 50000) / 1000).toFixed(2)}L Cr</td>

                {/* P/E */}
                <td className="py-3.5 font-medium text-zinc-300">{(s.pe_ratio ?? 22.4).toFixed(1)}</td>

                {/* RSI */}
                <td className="py-3.5">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${rsi > 65
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
                    className={`inline-flex items-center gap-1 font-bold ${isBullish ? "text-emerald-400" : "text-rose-400"
                      }`}
                  >
                    {isBullish ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {isBullish ? "+" : ""}{forecastPct.toFixed(2)}%
                  </span>
                  <span className="ml-1.5 text-[10px] text-zinc-500">({s.forecast_prob ?? 60}% Prob)</span>
                </td>

                {/* Action */}
                <td className="py-3.5 text-right">
                  <Link
                    to={`/stocks/${s.symbol}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Analyze <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
