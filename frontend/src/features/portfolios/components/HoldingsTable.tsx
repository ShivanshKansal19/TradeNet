import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { Holding } from "../types/portfolio";

interface Props {
  holdings: Holding[];
  onRemoveHolding: (symbol: string) => void;
}

export default function HoldingsTable({ holdings, onRemoveHolding }: Props) {
  if (holdings.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center text-sm text-zinc-500 shadow-xl backdrop-blur-sm">
        No holdings added yet. Click "+ Add Transaction" to build your portfolio.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <h3 className="font-semibold text-white">Holdings Details ({holdings.length} Assets)</h3>
      </div>

      <table className="mt-4 w-full text-left text-xs text-zinc-300">
        <thead>
          <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <th className="pb-3">Stock / Asset</th>
            <th className="pb-3">Quantity</th>
            <th className="pb-3">Avg Buy Price</th>
            <th className="pb-3">Current Price</th>
            <th className="pb-3">Invested Amount</th>
            <th className="pb-3">Current Value</th>
            <th className="pb-3">Total P&L</th>
            <th className="pb-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {holdings.map((h) => {
            const invested = h.quantity * h.averageBuyPrice;
            const current = h.quantity * h.currentPrice;
            const pnl = current - invested;
            const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
            const isPositive = pnl >= 0;

            return (
              <tr key={h.symbol} className="hover:bg-zinc-800/40 transition">
                <td className="py-3.5">
                  <Link to={`/stocks/${h.symbol}`} className="font-bold text-white hover:text-emerald-400 transition">
                    {h.symbol}
                  </Link>
                  <div className="text-[11px] text-zinc-500">{h.name} • {h.sector}</div>
                </td>

                <td className="py-3.5 font-semibold text-white">{h.quantity}</td>
                <td className="py-3.5 font-medium text-zinc-300">₹{h.averageBuyPrice.toFixed(2)}</td>
                <td className="py-3.5 font-bold text-white">₹{h.currentPrice.toFixed(2)}</td>
                <td className="py-3.5 font-medium text-zinc-300">₹{invested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td className="py-3.5 font-bold text-white">₹{current.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>

                <td className="py-3.5">
                  <div className={`font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPositive ? "+" : ""}₹{pnl.toFixed(2)}
                  </div>
                  <div className={`text-[11px] font-semibold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPositive ? "+" : ""}{pnlPct.toFixed(2)}%
                  </div>
                </td>

                <td className="py-3.5 text-right">
                  <button
                    onClick={() => onRemoveHolding(h.symbol)}
                    className="rounded-lg bg-zinc-800 hover:bg-rose-500/20 p-1.5 text-zinc-400 hover:text-rose-400 transition"
                    title="Remove Holding"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
