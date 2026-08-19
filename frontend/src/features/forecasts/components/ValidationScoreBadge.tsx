import React from "react";
import { CheckCircle2, Award, History } from "lucide-react";
import type { ValidationMetrics } from "../types/forecast";

interface Props {
  validation: ValidationMetrics;
}

export default function ValidationScoreBadge({ validation }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="text-amber-400" size={17} />
          <span className="text-xs font-semibold text-zinc-200">
            Walk-Forward Backtesting Score ({validation.test_window_sessions} sessions)
          </span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
            {validation.model_version}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-zinc-500">Directional Accuracy: </span>
            <span className="font-bold text-emerald-400">{validation.directional_accuracy}%</span>
          </div>
          <div>
            <span className="text-zinc-500">MAE vs Baseline: </span>
            <span className="font-bold text-emerald-400">+{validation.mae_improvement_pct}% Better</span>
          </div>
        </div>
      </div>
    </div>
  );
}
