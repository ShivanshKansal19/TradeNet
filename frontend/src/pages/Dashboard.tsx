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
        </div>
      </div>

      {/* Index cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {indices.map((index) => (
          <div
            key={index.name}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">{index.name}</p>

              <BarChart3 size={18} className="text-zinc-600" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <p className="text-2xl font-semibold">{index.value}</p>

              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  index.positive ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {index.positive ? (
                  <ArrowUp size={15} />
                ) : (
                  <ArrowDown size={15} />
                )}

                {index.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Market breadth */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Market Breadth</h2>
              <p className="mt-1 text-sm text-zinc-500">
                NSE advancing vs declining stocks
              </p>
            </div>

            <TrendingUp size={19} className="text-zinc-500" />
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-500">Advancing</span>

              <span>1,248</span>
            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[68%] rounded-full bg-emerald-500" />
            </div>

            <div className="mt-6 flex justify-between text-sm">
              <span className="text-red-500">Declining</span>

              <span>584</span>
            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[32%] rounded-full bg-red-500" />
            </div>
          </div>
        </div>

        {/* Top movers */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div>
            <h2 className="font-semibold">Top Movers</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Stocks with notable price changes
            </p>
          </div>

          <div className="mt-5 divide-y divide-zinc-800">
            {movers.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">{stock.symbol}</p>

                  <p className="text-xs text-zinc-500">{stock.name}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm">{stock.price}</p>

                  <p
                    className={`text-xs ${
                      stock.positive ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {stock.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
