import React from "react";
import { TrendingUp, Award, BarChart2 } from "lucide-react";

interface Props {
  portfolioReturnPct: number;
  benchmarkName?: string;
  benchmarkReturnPct?: number;
}

export default function BenchmarkComparison({
  portfolioReturnPct = 12.4,
  benchmarkName = "NIFTY 50",
  benchmarkReturnPct = 8.6,
}: Props) {
  const alpha = portfolioReturnPct - benchmarkReturnPct;
  const isOutperforming = alpha >= 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">Benchmark Alpha Comparison</h3>
        </div>
        <span
          className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
            isOutperforming ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {isOutperforming ? `+${alpha.toFixed(2)}% Alpha` : `${alpha.toFixed(2)}% Lag`}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {/* Portfolio Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white">Your Portfolio</span>
            <span className="text-emerald-400">+{portfolioReturnPct.toFixed(2)}%</span>
          </div>
          <div className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Math.max(10, portfolioReturnPct * 4))}%` }} />
          </div>
        </div>

        {/* Benchmark Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-zinc-400">{benchmarkName} Index</span>
            <span className="text-zinc-300">+{benchmarkReturnPct.toFixed(2)}%</span>
          </div>
          <div className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, Math.max(10, benchmarkReturnPct * 4))}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
