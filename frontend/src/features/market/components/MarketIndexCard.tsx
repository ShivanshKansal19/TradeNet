// src/features/market/components/MarketIndexCard.tsx

import type { MarketIndex } from "../types/market";

interface Props {
  index: MarketIndex;
}

export default function MarketIndexCard({ index }: Props) {
  const isPositive = index.change >= 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-300">{index.name}</h3>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {index.change_percent.toFixed(2)}%
        </span>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight">
          ₹{index.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`mt-1 text-sm font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}
          {index.change.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
