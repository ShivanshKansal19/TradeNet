import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import {
  MarketIndexCard,
  MarketBreadth,
  TopMovers,
  useMarketOverview,
  MarketDashboardSkeleton,
  MarketStatusBadge,
  MarketLastUpdated,
} from "../features/market";

const sectors = [
  { name: "Information Technology", query: "Technology", change: "+1.82%" },
  { name: "Banking & Financials", query: "Banking", change: "+1.12%" },
  { name: "Automobile & EV", query: "Automobile", change: "+0.54%" },
  { name: "Consumer FMCG", query: "FMCG", change: "-0.31%" },
  { name: "Energy & Oil", query: "Energy", change: "+2.14%" },
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
          <p className="font-medium text-white">Unable to load market data</p>
          <p className="mt-1 text-sm text-zinc-500">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Indian Equity Market Overview
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Track NSE & BSE indices, breadth sentiment, sector leadership, and top market movers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MarketStatusBadge status={data.market_status} />
            <MarketLastUpdated timestamp={data.timestamp} />
          </div>
        </div>
      </div>

      {/* Index Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {data.indices.map((index) => (
          <MarketIndexCard key={index.symbol} index={index} />
        ))}
      </section>

      {/* Main Grid: Breadth & Movers */}
      <section className="grid gap-6 lg:grid-cols-2">
        <MarketBreadth breadth={data.breadth} />
        <TopMovers gainers={data.movers.gainers} losers={data.movers.losers} />
      </section>

      {/* Sector Performance */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-400" />
            <div>
              <h2 className="font-semibold text-white">Sector Performance & Heatmap</h2>
              <p className="text-xs text-zinc-400">Intraday sector-level rotation and momentum</p>
            </div>
          </div>
          <Link
            to="/screener"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            Explore in Screener <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {sectors.map((sector) => {
            const positive = sector.change.startsWith("+");

            return (
              <div key={sector.name} className="flex items-center gap-4">
                <p className="w-48 text-xs font-semibold text-zinc-300 truncate">{sector.name}</p>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${positive ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{
                      width: positive ? "68%" : "30%",
                    }}
                  />
                </div>

                <span
                  className={`w-16 text-right text-xs font-bold ${
                    positive ? "text-emerald-400" : "text-rose-400"
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
