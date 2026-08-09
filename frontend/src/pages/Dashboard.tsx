import MarketIndexCard from "../components/market/MarketIndexCard";
import MarketBreadth from "../components/market/MarketBreadth";
import TopMovers from "../components/market/TopMovers";
import { useMarketOverview } from "../hooks/useMarketOverview";
import MarketDashboardSkeleton from "../components/market/MarketDashboardSkeleton";
import MarketStatusBadge from "../components/market/MarketStatusBadge";
import MarketLastUpdated from "../components/market/MarketLastUpdated";
import { ArrowDown, ArrowUp, BarChart3, TrendingUp } from "lucide-react";

const indices = [
  {
    name: "NIFTY 50",
    value: "24,363.30",
    change: "+0.82%",
    positive: true,
  },
  {
    name: "SENSEX",
    value: "80,976.55",
    change: "+0.61%",
    positive: true,
  },
  {
    name: "NIFTY BANK",
    value: "55,214.20",
    change: "-0.24%",
    positive: false,
  },
];

const movers = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: "₹1,420.50",
    change: "+2.84%",
    positive: true,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: "₹3,842.20",
    change: "+2.31%",
    positive: true,
  },
  {
    symbol: "INFY",
    name: "Infosys",
    price: "₹1,632.40",
    change: "-1.72%",
    positive: false,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    price: "₹1,946.30",
    change: "-1.21%",
    positive: false,
  },
];

const sectors = [
  { name: "Information Technology", change: "+1.82%" },
  { name: "Banking", change: "+1.12%" },
  { name: "Automobile", change: "+0.54%" },
  { name: "FMCG", change: "-0.31%" },
  { name: "Pharmaceuticals", change: "-0.48%" },
];

export default function Dashboard() {
  const { data, isLoading, isError } = useMarketOverview();

  if (isLoading) {
    return <MarketDashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="font-medium">Unable to load market data</p>

          <p className="mt-1 text-sm text-zinc-500">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-zinc-500">Sunday, August 9</p>

        <div className="mt-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Market Overview
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Track the Indian market and discover opportunities.
            </p>
          </div>
          <MarketStatusBadge status={data.market_status} />
          <MarketLastUpdated timestamp={data.timestamp} />
        </div>
      </div>

      {/* Index cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {data.indices.map((index) => (
          <MarketIndexCard key={index.symbol} index={index} />
        ))}
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Market breadth */}
        <MarketBreadth breadth={data.breadth} />

        {/* Top movers */}
        <TopMovers gainers={data.movers.gainers} losers={data.movers.losers} />
      </section>

      {/* Sectors */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div>
          <h2 className="font-semibold">Sector Performance</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Today's sector-level performance
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {sectors.map((sector) => {
            const positive = sector.change.startsWith("+");

            return (
              <div key={sector.name} className="flex items-center gap-4">
                <p className="w-44 text-sm text-zinc-400">{sector.name}</p>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      positive ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{
                      width: positive ? "70%" : "25%",
                    }}
                  />
                </div>

                <span
                  className={`w-16 text-right text-sm ${
                    positive ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {sector.change}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
