import React from "react";
import type { Stock } from "../types/stock";

interface Props {
  stock: Stock;
}

export function formatMarketCap(mcap?: number): string {
  if (!mcap || mcap <= 0) return "N/A";
  
  if (mcap >= 1e12) {
    return `₹${(mcap / 1e12).toFixed(2)} Lakh Cr`;
  } else if (mcap >= 1e7) {
    return `₹${(mcap / 1e7).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
  } else if (mcap >= 1e5) {
    return `₹${(mcap / 1e5).toFixed(2)} Lakh Cr`;
  } else if (mcap > 0) {
    return `₹${mcap.toLocaleString("en-IN")} Cr`;
  }
  return "N/A";
}

export default function StockFundamentalsCard({ stock }: Props) {
  const price = stock.price ?? 0;
  const dayHigh = stock.day_high || (price > 0 ? price * 1.01 : 0);
  const dayLow = stock.day_low || (price > 0 ? price * 0.99 : 0);

  // Normalize dividend yield percentage
  const divYieldStr = stock.dividend_yield
    ? `${(stock.dividend_yield < 1 ? stock.dividend_yield * 100 : stock.dividend_yield).toFixed(2)}%`
    : "0.00%";

  const metrics = [
    { label: "Market Cap", value: formatMarketCap(stock.market_cap) },
    { label: "P/E Ratio (TTM)", value: stock.pe_ratio ? stock.pe_ratio.toFixed(2) : "N/A" },
    { label: "P/B Ratio", value: stock.pb_ratio ? stock.pb_ratio.toFixed(2) : "N/A" },
    { label: "EPS (TTM)", value: stock.eps ? `₹${stock.eps.toFixed(2)}` : "N/A" },
    { label: "Dividend Yield", value: divYieldStr },
    { label: "Day's High", value: dayHigh > 0 ? `₹${dayHigh.toFixed(2)}` : "N/A" },
    { label: "Day's Low", value: dayLow > 0 ? `₹${dayLow.toFixed(2)}` : "N/A" },
    { label: "Volume (Today)", value: stock.volume ? stock.volume.toLocaleString("en-IN") : "N/A" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <h3 className="font-semibold text-white">Fundamentals & Valuation</h3>
      <p className="text-xs text-zinc-400 mt-0.5">Key ratios and financial indicators</p>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5">
            <p className="text-xs font-medium text-zinc-400">{m.label}</p>
            <p className="mt-1 text-base font-bold tracking-tight text-white">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
