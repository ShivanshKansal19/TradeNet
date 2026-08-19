// src/features/market/components/TopMovers.tsx

import type { StockMover } from "../types/market";

interface Props {
  gainers: StockMover[];
  losers: StockMover[];
}

export default function TopMovers({ gainers, losers }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="font-semibold">Top Movers</h2>
      <p className="mt-1 text-sm text-zinc-500">Biggest gainers and losers today</p>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {/* Gainers */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Top Gainers</p>
          <div className="mt-3 space-y-2">
            {gainers.slice(0, 5).map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <div>
                  <p className="font-medium text-sm text-zinc-200">{stock.symbol}</p>
                  <p className="text-xs text-zinc-500">₹{stock.price.toFixed(2)}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">+{stock.change_percent.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Top Losers</p>
          <div className="mt-3 space-y-2">
            {losers.slice(0, 5).map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between py-1 border-b border-zinc-800/40">
                <div>
                  <p className="font-medium text-sm text-zinc-200">{stock.symbol}</p>
                  <p className="text-xs text-zinc-500">₹{stock.price.toFixed(2)}</p>
                </div>
                <span className="text-xs font-semibold text-red-400">{stock.change_percent.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
