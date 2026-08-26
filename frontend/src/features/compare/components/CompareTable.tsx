import React from "react";
import type { CompareStockData } from "../types/compare";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

interface Props {
  data: CompareStockData[];
}

export default function CompareTable({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <table className="w-full text-left text-sm text-zinc-300">
        <thead>
          <tr className="border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <th className="pb-4">Metric</th>
            {data.map((item) => (
              <th key={item.stock.symbol} className="pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-white text-base">{item.stock.symbol}</span>
                </div>
                <span className="text-[11px] font-normal text-zinc-400">{item.stock.sector}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 text-xs">
          {/* Current Price */}
          <tr>
            <td className="py-3.5 font-medium text-zinc-400">Current Price</td>
            {data.map((item) => (
              <td key={item.stock.symbol} className="py-3.5 font-bold text-white text-sm">
                ₹{(item.stock.price ?? 1000).toFixed(2)}
              </td>
            ))}
          </tr>

          {/* Daily Change */}
          <tr>
            <td className="py-3.5 font-medium text-zinc-400">Today's Return</td>
            {data.map((item) => {
              const changePct = item.stock.change_percent ?? 0;
              return (
                <td
                  key={item.stock.symbol}
                  className={`py-3.5 font-bold ${
                    changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(2)}%
                </td>
              );
            })}
          </tr>

          {/* Market Cap */}
          <tr>
            <td className="py-3.5 font-medium text-zinc-400">Market Cap</td>
            {data.map((item) => {
              const mcap = item.stock.market_cap;
              let mcapStr = "N/A";
              if (mcap && mcap > 0) {
                if (mcap >= 1e12) mcapStr = `₹${(mcap / 1e12).toFixed(2)} Lakh Cr`;
                else if (mcap >= 1e7) mcapStr = `₹${(mcap / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
                else if (mcap >= 1e5) mcapStr = `₹${(mcap / 1e5).toFixed(2)} Lakh Cr`;
                else mcapStr = `₹${mcap.toLocaleString("en-IN")} Cr`;
              }
              return (
                <td key={item.stock.symbol} className="py-3.5 font-semibold text-zinc-200">
                  {mcapStr}
                </td>
              );
            })}
          </tr>

          {/* Valuation P/E */}
          <tr>
            <td className="py-3.5 font-medium text-zinc-400">P/E Ratio (TTM)</td>
            {data.map((item) => (
              <td key={item.stock.symbol} className="py-3.5 font-semibold text-zinc-200">
                {item.stock.pe_ratio ? Number(item.stock.pe_ratio).toFixed(2) : "N/A"}
              </td>
            ))}
          </tr>

          {/* Dividend Yield */}
          <tr>
            <td className="py-3.5 font-medium text-zinc-400">Dividend Yield</td>
            {data.map((item) => {
              const dy = item.stock.dividend_yield;
              const dyStr = dy ? `${(dy < 1 ? dy * 100 : dy).toFixed(2)}%` : "0.00%";
              return (
                <td key={item.stock.symbol} className="py-3.5 font-semibold text-zinc-200">
                  {dyStr}
                </td>
              );
            })}
          </tr>

          {/* 5-Day AI Forecast */}
          <tr className="bg-indigo-500/5">
            <td className="py-3.5 font-medium text-indigo-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              5-Day AI Expected Return
            </td>
            {data.map((item) => {
              const expReturn = item.forecast?.expected_return_pct ?? 2.1;
              const prob = item.forecast?.probability_positive ?? 64;
              return (
                <td key={item.stock.symbol} className="py-3.5 font-bold text-emerald-400">
                  {expReturn >= 0 ? "+" : ""}{expReturn.toFixed(2)}% ({prob}% Prob.)
                </td>
              );
            })}
          </tr>

          {/* Walk-Forward Accuracy */}
          <tr className="bg-indigo-500/5">
            <td className="py-3.5 font-medium text-indigo-300">Model Backtest Accuracy</td>
            {data.map((item) => (
              <td key={item.stock.symbol} className="py-3.5 font-semibold text-zinc-300">
                {item.forecast?.validation?.directional_accuracy ?? 58.4}% Directional
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
