// src/features/market/components/MarketBreadth.tsx

import type { MarketBreadth as MarketBreadthType } from "../types/market";

interface Props {
  breadth: MarketBreadthType;
}

export default function MarketBreadth({ breadth }: Props) {
  const total = breadth.advancing + breadth.declining + breadth.unchanged;
  const advancePercent = (breadth.advancing / total) * 100;
  const declinePercent = (breadth.declining / total) * 100;
  const unchangedPercent = (breadth.unchanged / total) * 100;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Market Breadth</h2>
          <p className="mt-1 text-sm text-zinc-500">Advance / Decline ratio</p>
        </div>
        <span className="text-sm font-medium text-emerald-400">
          {(breadth.advancing / (breadth.declining || 1)).toFixed(2)} A/D
        </span>
      </div>

      <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-zinc-800">
        <div style={{ width: `${advancePercent}%` }} className="bg-emerald-500 transition-all duration-500" />
        <div style={{ width: `${unchangedPercent}%` }} className="bg-zinc-600 transition-all duration-500" />
        <div style={{ width: `${declinePercent}%` }} className="bg-red-500 transition-all duration-500" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-emerald-400">{breadth.advancing}</p>
          <p className="text-xs text-zinc-500">Advances</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-400">{breadth.unchanged}</p>
          <p className="text-xs text-zinc-500">Unchanged</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">{breadth.declining}</p>
          <p className="text-xs text-zinc-500">Declines</p>
        </div>
      </div>
    </div>
  );
}
