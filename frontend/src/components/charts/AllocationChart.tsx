import React from "react";

export interface AllocationItem {
  label: string;
  value: number; // percentage or currency amount
  color: string;
}

interface Props {
  items: AllocationItem[];
  title?: string;
  totalLabel?: string;
  totalValue?: string;
}

export default function AllocationChart({
  items = [],
  title = "Asset Allocation",
  totalLabel = "Total",
  totalValue = "100%",
}: Props) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  // Calculate SVG donut wedges
  let cumulativeAngle = 0;
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const strokeWidth = 24;

  const wedges = items.map((item) => {
    const fraction = item.value / total;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    // Circumference and stroke dasharray math
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
    const strokeDashoffset = -((startAngle / 360) * circumference);

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      percentage: ((item.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      <h3 className="font-semibold text-white">{title}</h3>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-8 justify-center">
        {/* Donut Chart */}
        <div className="relative flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
            {wedges.map((w, idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={radius}
                fill="transparent"
                stroke={w.color}
                strokeWidth={strokeWidth}
                strokeDasharray={w.strokeDasharray}
                strokeDashoffset={w.strokeDashoffset}
                className="transition-all duration-500"
              />
            ))}
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xs text-zinc-500">{totalLabel}</span>
            <span className="text-sm font-bold text-white">{totalValue}</span>
          </div>
        </div>

        {/* Breakdown Legend */}
        <div className="space-y-3 w-full sm:w-auto">
          {wedges.map((w, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                <span className="text-zinc-300 font-medium">{w.label}</span>
              </div>
              <span className="font-semibold text-zinc-100">{w.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
