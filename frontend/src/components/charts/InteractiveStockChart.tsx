import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useStockPriceHistory } from "../../features/stocks";

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
  data: propData,
  height = 340,
}: Props) {
  const [selectedRange, setSelectedRange] = useState<Range>("1Y");
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Query live price history for this symbol and range
  const { data: fetchedData, isLoading, isFetching } = useStockPriceHistory(symbol, selectedRange);

  // Use fetched live history if available, else propData, else synthetic fallback
  const chartPoints: ChartDataPoint[] = useMemo(() => {
    if (fetchedData && fetchedData.length > 0) {
      return fetchedData;
    }
    if (propData && propData.length > 0) {
      return propData;
    }
    return [];
  }, [fetchedData, propData]);

  const minPrice = useMemo(() => {
    if (chartPoints.length === 0) return 0;
    return Math.min(...chartPoints.map((p) => p.close));
  }, [chartPoints]);

  const maxPrice = useMemo(() => {
    if (chartPoints.length === 0) return 100;
    return Math.max(...chartPoints.map((p) => p.close));
  }, [chartPoints]);

  const maxVolume = useMemo(() => {
    if (chartPoints.length === 0) return 1;
    return Math.max(...chartPoints.map((p) => p.volume || 0), 1);
  }, [chartPoints]);

  const priceChange = useMemo(() => {
    if (chartPoints.length < 2) return 0;
    return chartPoints[chartPoints.length - 1].close - chartPoints[0].close;
  }, [chartPoints]);

  const percentChange = useMemo(() => {
    if (chartPoints.length < 2 || chartPoints[0].close === 0) return 0;
    return (priceChange / chartPoints[0].close) * 100;
  }, [chartPoints, priceChange]);

  const isPositive = priceChange >= 0;
  const activeColor = isPositive ? "#10b981" : "#f43f5e";

  // SVG Coordinates calculation
  const width = 800;
  const padding = { top: 25, right: 65, bottom: 40, left: 15 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const pointsSvg = useMemo(() => {
    if (chartPoints.length === 0) return "";
    const rangeY = maxPrice - minPrice || 1;
    return chartPoints
      .map((p, idx) => {
        const x = padding.left + (idx / Math.max(chartPoints.length - 1, 1)) * graphWidth;
        const y = padding.top + graphHeight - ((p.close - minPrice) / rangeY) * graphHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [chartPoints, minPrice, maxPrice, graphWidth, graphHeight]);

  const areaSvg = useMemo(() => {
    if (!pointsSvg || chartPoints.length === 0) return "";
    const firstX = padding.left;
    const lastX = padding.left + graphWidth;
    const bottomY = padding.top + graphHeight;
    return `${pointsSvg} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pointsSvg, chartPoints, graphWidth, graphHeight]);

  const currentDisplayPoint = hoveredPoint || (chartPoints.length > 0 ? chartPoints[chartPoints.length - 1] : null);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
      {/* Header with quick stats and range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold tracking-tight text-white">
              ₹{(currentDisplayPoint ? currentDisplayPoint.close : 0).toLocaleString("en-IN", {
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
            {isFetching && <Loader2 size={15} className="animate-spin text-zinc-500" />}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {hoveredPoint ? (
              <span className="text-zinc-300">
                Date: <strong className="text-white">{hoveredPoint.date}</strong> | Open: ₹{hoveredPoint.open?.toFixed(2)} | High: ₹{hoveredPoint.high?.toFixed(2)} | Low: ₹{hoveredPoint.low?.toFixed(2)} | Vol: {hoveredPoint.volume?.toLocaleString("en-IN")}
              </span>
            ) : (
              <span>Historical Price Action • {selectedRange} Range • {symbol}</span>
            )}
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
        {isLoading && chartPoints.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
          </div>
        ) : chartPoints.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            No price history available for the selected range.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeColor} stopOpacity="0.28" />
                <stop offset="100%" stopColor={activeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Guidelines */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left + graphWidth}
              y2={padding.top}
              stroke="#27272a"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={padding.top + graphHeight / 2}
              x2={padding.left + graphWidth}
              y2={padding.top + graphHeight / 2}
              stroke="#27272a"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={padding.top + graphHeight}
              x2={padding.left + graphWidth}
              y2={padding.top + graphHeight}
              stroke="#27272a"
            />

            {/* Right Axis Labels */}
            <text x={padding.left + graphWidth + 8} y={padding.top + 4} fill="#71717a" fontSize="10">
              ₹{maxPrice.toFixed(0)}
            </text>
            <text x={padding.left + graphWidth + 8} y={padding.top + graphHeight / 2 + 4} fill="#71717a" fontSize="10">
              ₹{((maxPrice + minPrice) / 2).toFixed(0)}
            </text>
            <text x={padding.left + graphWidth + 8} y={padding.top + graphHeight + 4} fill="#71717a" fontSize="10">
              ₹{minPrice.toFixed(0)}
            </text>

            {/* Volume Histogram (bottom 20% of graph) */}
            {chartPoints.map((p, idx) => {
              const barW = Math.max(1, (graphWidth / chartPoints.length) - 1.5);
              const x = padding.left + (idx / Math.max(chartPoints.length - 1, 1)) * graphWidth - barW / 2;
              const barH = ((p.volume || 0) / maxVolume) * (graphHeight * 0.22);
              const y = padding.top + graphHeight - barH;
              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill="#52525b"
                  opacity="0.30"
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

            {/* Hover Crosshair and Dot */}
            {hoveredPoint && (() => {
              const idx = chartPoints.indexOf(hoveredPoint);
              if (idx === -1) return null;
              const rangeY = maxPrice - minPrice || 1;
              const x = padding.left + (idx / Math.max(chartPoints.length - 1, 1)) * graphWidth;
              const y = padding.top + graphHeight - ((hoveredPoint.close - minPrice) / rangeY) * graphHeight;
              return (
                <g>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke="#a1a1aa"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <circle cx={x} cy={y} r="5" fill={activeColor} stroke="#ffffff" strokeWidth="2" />
                </g>
              );
            })()}

            {/* Interactive Hover overlays */}
            {chartPoints.map((p, idx) => {
              const x = padding.left + (idx / Math.max(chartPoints.length - 1, 1)) * graphWidth;
              const sliceW = graphWidth / Math.max(chartPoints.length, 1);
              return (
                <rect
                  key={idx}
                  x={x - sliceW / 2}
                  y={padding.top}
                  width={sliceW}
                  height={graphHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(p)}
                  className="cursor-crosshair"
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* Axis Footnote */}
      <div className="mt-3 flex justify-between text-[11px] font-medium text-zinc-500">
        <span>{chartPoints[0]?.date || "Start"}</span>
        <span>Daily Trading Volume & OHLCV Action</span>
        <span>{chartPoints[chartPoints.length - 1]?.date || "Latest"}</span>
      </div>
    </div>
  );
}
