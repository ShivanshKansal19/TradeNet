import { TrendingUp, TrendingDown, Wallet, DollarSign, PieChart } from "lucide-react";
import type { PortfolioSummary } from "../types/portfolio";

interface Props {
  summary: PortfolioSummary;
}

export default function PortfolioOverviewCards({ summary }: Props) {
  const isPositiveTotal = summary.totalPnl >= 0;
  const isPositiveToday = summary.todayPnl >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Portfolio Value */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Total Portfolio Value</span>
          <Wallet size={16} className="text-zinc-500" />
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-white">
          ₹{summary.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400">
          Invested: ₹{summary.totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Overall Return */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Overall Profit / Loss</span>
          {isPositiveTotal ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-rose-400" />}
        </div>
        <p
          className={`mt-2 text-2xl font-bold tracking-tight ${
            isPositiveTotal ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isPositiveTotal ? "+" : ""}₹{summary.totalPnl.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
        <p className={`mt-1 text-[11px] font-semibold ${isPositiveTotal ? "text-emerald-400" : "text-rose-400"}`}>
          {isPositiveTotal ? "+" : ""}{summary.totalPnlPercent.toFixed(2)}% All-Time Return
        </p>
      </div>

      {/* Today's Return */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Today's P&L</span>
          <PieChart size={16} className="text-zinc-500" />
        </div>
        <p
          className={`mt-2 text-2xl font-bold tracking-tight ${
            isPositiveToday ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isPositiveToday ? "+" : ""}₹{summary.todayPnl.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
        <p className={`mt-1 text-[11px] font-semibold ${isPositiveToday ? "text-emerald-400" : "text-rose-400"}`}>
          {isPositiveToday ? "+" : ""}{summary.todayPnlPercent.toFixed(2)}% Today
        </p>
      </div>

      {/* Cash Balance */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400">Available Cash Balance</span>
          <DollarSign size={16} className="text-zinc-500" />
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-white">
          ₹{summary.cashBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400">Ready for instant deployment</p>
      </div>
    </div>
  );
}
