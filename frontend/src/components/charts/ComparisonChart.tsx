import React, { useState } from "react";

export interface StockSeries {
  symbol: string;
  name: string;
  color: string;
  data: number[]; // Array of percentage changes from day 0 (e.g. 0, 1.2, -0.5, 3.4...)
}

interface Props {
  series: StockSeries[];
  labels?: string[];
  height?: number;
}

export default function ComparisonChart({
  series = [],
  labels = [],
  height = 280,
}: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (series.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 text-zinc-500">
        Select at least 2 stocks to view performance overlay
      </div>
    );
  }

  const pointCount = Math.max(...series.map((s) => s.data.length), 1);
  const allValues = series.flatMap((s) => s.data);
  const minVal = Math.min(-5, ...allValues);
  const maxVal = Math.max(5, ...allValues);
  const rangeVal = maxVal - minVal || 1;

  const width = 800;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Zero-line Y coordinate
  const zeroY = padding.top + graphHeight - ((0 - minVal) / rangeVal) * graphHeight;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      {/* Legend Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h3 className="font-semibold text-white">Relative Performance Comparison</h3>
          <p className="text-xs text-zinc-400">Normalized percentage return (%)</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {series.map((s) => (
            <div key={s.symbol} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="font-bold text-zinc-200">{s.symbol}</span>
              <span
                className={`font-semibold ${
                  (s.data[s.data.length - 1] || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {(s.data[s.data.length - 1] || 0) >= 0 ? "+" : ""}
                {(s.data[s.data.length - 1] || 0).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative mt-5 select-none" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid Baseline at 0% */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={padding.left + graphWidth}
            y2={zeroY}
            stroke="#52525b"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x={padding.left - 8} y={zeroY + 4} fill="#71717a" fontSize="10" textAnchor="end">
            0%
          </text>

          {/* Series Lines */}
          {series.map((s) => {
            const pathPoints = s.data
              .map((val, idx) => {
                const x = padding.left + (idx / (pointCount - 1)) * graphWidth;
                const y = padding.top + graphHeight - ((val - minVal) / rangeVal) * graphHeight;
                return `${x},${y}`;
              })
              .join(" ");

            return (
              <path
                key={s.symbol}
                d={`M ${pathPoints}`}
                fill="none"
                stroke={s.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
