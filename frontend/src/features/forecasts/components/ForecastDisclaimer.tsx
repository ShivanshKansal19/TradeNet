import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ForecastDisclaimer() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-200/80">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
      <span>
        <strong>Educational Disclaimer:</strong> Machine learning forecasts are probabilistic decision-support estimates and do not constitute financial advice. Past walk-forward validation does not guarantee future market returns.
      </span>
    </div>
  );
}
