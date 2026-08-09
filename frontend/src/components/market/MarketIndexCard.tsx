import { ArrowDown, ArrowUp, BarChart3 } from "lucide-react";

import type { MarketIndex } from "../../types/market";

interface MarketIndexCardProps {
  index: MarketIndex;
}

export default function MarketIndexCard({ index }: MarketIndexCardProps) {
  const positive = index.change_percent >= 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{index.name}</p>

        <BarChart3 size={18} className="text-zinc-600" />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold">
            {index.value.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-1 text-xs text-zinc-500">{index.symbol}</p>
        </div>

        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            positive ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {positive ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
          {positive ? "+" : ""}
          {index.change_percent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
