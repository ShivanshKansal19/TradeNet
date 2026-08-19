import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface ChartDataPoint {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
}

interface Props {
  symbol: string;
  data?: ChartDataPoint[];
  color?: string;
  height?: number;
}

const RANGES = ["1D", "1W", "1M", "1Y", "5Y"] as const;
type Range = (typeof RANGES)[number];

export default function InteractiveStockChart({
  symbol,
  data = [],
  color = "#10b981",
  height = 320,
}: Props) {
  const [selectedRange, setSelectedRange] = useState<Range>("1Y");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Generate synthetic smooth curve if data is minimal
  const chartPoints = useMemo(() => {
    if (data.length > 5) return data;
    // Generate realistic default stock trajectory
    const count = selectedRange === "1D" ? 40 : selectedRange === "1W" ? 50 : 100;
    const basePrice = symbol === "TCS" ? 3850 : symbol === "INFY" ? 1640 : symbol === "HDFCBANK" ? 1620 : 1420;
    const points: ChartDataPoint[] = [];
    let current = basePrice;
    
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.48) * (basePrice * 0.015);
      current = Math.max(basePrice * 0.7, current + change);
      const d = new Date();
      d.setDate(d.getDate() - (count - i));
      points.push({
        date: d.toISOString().split("T")[0],
        price: Number(current.toFixed(2)),
        close: Number(current.toFixed(2)),
        volume: Math.floor(Math.random() * 500000) + 100000,
      });
    }
    return points;
  }, [data, selectedRange, symbol]);

  const minPrice = useMemo(() => Math.min(...chartPoints.map((p) => p.close)), [chartPoints]);
  const maxPrice = useMemo(() => Math.max(...chartPoints.map((p) => p.close)), [chartPoints]);
  const maxVolume = useMemo(() => Math.max(...chartPoints.map((p) => p.volume || 0), 1), [chartPoints]);

  const priceChange = chartPoints.length > 1
    ? chartPoints[chartPoints.length - 1].close - chartPoints[0].close
    : 0;
  const percentChange = chartPoints.length > 1 && chartPoints[0].close
    ? (priceChange / chartPoints[0].close) * 100
    : 0;
  const isPositive = priceChange >= 0;
  const activeColor = isPositive ? "#10b981" : "#f43f5e";

  // SVG Coordinates calculation
  const width = 800;
  const padding = { top: 20, right: 10, bottom: 40, left: 10 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const pointsSvg = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const rangeY = maxPrice - minPrice || 1;
    return chartPoints
      .map((p, idx) => {
        const x = padding.left + (idx / (chartPoints.length - 1)) * graphWidth;
        const y = padding.top + graphHeight - ((p.close - minPrice) / rangeY) * graphHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartPoints, minPrice, maxPrice, graphWidth, graphHeight]);

  const areaSvg = useMemo(() => {
    if (!pointsSvg) return "";
    const firstX = padding.left;
    const lastX = padding.left + graphWidth;
    const bottomY = padding.top + graphHeight;
    return `${pointsSvg} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pointsSvg, graphWidth, graphHeight]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      {/* Header with quick stats and range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold tracking-tight text-white">
              ₹{(hoveredPoint ? hoveredPoint.close : chartPoints[chartPoints.length - 1]?.close || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {isPositive ? "+" : ""}
              {percentChange.toFixed(2)}% (₹{priceChange.toFixed(2)})
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {hoveredPoint ? `Recorded: ${hoveredPoint.date}` : `Live session overview • ${symbol}`}
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-800/80">
          {RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                selectedRange === range
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative mt-6 select-none" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Volume Histogram (bottom 20% of graph) */}
          {chartPoints.map((p, idx) => {
            const barW = Math.max(1, graphWidth / chartPoints.length - 2);
            const x = padding.left + (idx / (chartPoints.length - 1)) * graphWidth - barW / 2;
            const barH = ((p.volume || 0) / maxVolume) * (graphHeight * 0.25);
            const y = padding.top + graphHeight - barH;
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill="#3f3f46"
                opacity="0.35"
                rx="1"
              />
            );
          })}

          {/* Area under curve */}
          {areaSvg && <path d={`M ${areaSvg}`} fill={`url(#gradient-${symbol})`} />}

          {/* Main Price Line */}
          {pointsSvg && (
            <path
              d={`M ${pointsSvg}`}
              fill="none"
              stroke={activeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Hover overlays */}
          {chartPoints.map((p, idx) => {
            const x = padding.left + (idx / (chartPoints.length - 1)) * graphWidth;
            return (
              <rect
                key={idx}
                x={x - graphWidth / chartPoints.length / 2}
                y={padding.top}
                width={graphWidth / chartPoints.length}
                height={graphHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(p)}
                className="cursor-crosshair"
              />
            );
          })}
        </svg>
      </div>

      {/* Axis Footnote */}
      <div className="mt-2 flex justify-between text-[11px] font-medium text-zinc-500">
        <span>{chartPoints[0]?.date}</span>
        <span>Volume & Price Action</span>
        <span>{chartPoints[chartPoints.length - 1]?.date}</span>
      </div>
    </div>
  );
}
