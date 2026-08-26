import { Link } from "react-router-dom";
import type { StockMover } from "../types/market";

interface Props {
  gainers: StockMover[];
  losers: StockMover[];
}

export default function TopMovers({ gainers, losers }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <h2 className="font-semibold text-white">Top Movers</h2>
      <p className="mt-0.5 text-xs text-zinc-400">Biggest intraday gainers and losers across NSE</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Gainers */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Top Gainers</p>
          <div className="mt-3 space-y-2.5">
            {gainers.slice(0, 5).map((stock) => (
              <Link
                key={stock.symbol}
                to={`/stocks/${stock.symbol}`}
                className="flex items-center justify-between py-1 border-b border-zinc-800/60 hover:bg-zinc-900/80 px-2 rounded-lg transition"
              >
                <div>
                  <p className="font-bold text-xs text-white hover:text-emerald-400 transition">{stock.symbol}</p>
                  <p className="text-[11px] text-zinc-500">₹{stock.price.toFixed(2)}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400">+{stock.change_percent.toFixed(2)}%</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Top Losers</p>
          <div className="mt-3 space-y-2.5">
            {losers.slice(0, 5).map((stock) => (
              <Link
                key={stock.symbol}
                to={`/stocks/${stock.symbol}`}
                className="flex items-center justify-between py-1 border-b border-zinc-800/60 hover:bg-zinc-900/80 px-2 rounded-lg transition"
              >
                <div>
                  <p className="font-bold text-xs text-white hover:text-rose-400 transition">{stock.symbol}</p>
                  <p className="text-[11px] text-zinc-500">₹{stock.price.toFixed(2)}</p>
                </div>
                <span className="text-xs font-bold text-rose-400">{stock.change_percent.toFixed(2)}%</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
