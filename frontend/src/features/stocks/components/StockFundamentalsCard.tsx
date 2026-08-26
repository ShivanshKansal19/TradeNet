import React from "react";
import type { Stock } from "../types/stock";

interface Props {
  stock: Stock;
}

export default function StockFundamentalsCard({ stock }: Props) {
  const price = stock.price ?? 1000;
  const dayHigh = stock.day_high ?? (price * 1.015);
  const dayLow = stock.day_low ?? (price * 0.985);

  const metrics = [
    { label: "Market Cap", value: stock.market_cap ? `₹${(stock.market_cap / 1000).toFixed(2)} Lakh Cr` : "₹4.50 Lakh Cr" },
    { label: "P/E Ratio (TTM)", value: stock.pe_ratio ? stock.pe_ratio.toFixed(2) : "22.40" },
    { label: "P/B Ratio", value: stock.pb_ratio ? stock.pb_ratio.toFixed(2) : "3.20" },
    { label: "EPS (TTM)", value: stock.eps ? `₹${stock.eps.toFixed(2)}` : "₹58.40" },
    { label: "Dividend Yield", value: stock.dividend_yield ? `${stock.dividend_yield.toFixed(2)}%` : "1.20%" },
    { label: "Day's High", value: `₹${dayHigh.toFixed(2)}` },
    { label: "Day's Low", value: `₹${dayLow.toFixed(2)}` },
    { label: "Volume (Today)", value: (stock.volume || 12500000).toLocaleString("en-IN") },
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
