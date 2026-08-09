import type { MarketBreadth as MarketBreadthData } from "../../types/market";

interface MarketBreadthProps {
  breadth: MarketBreadthData;
}

export default function MarketBreadth({ breadth }: MarketBreadthProps) {
  const total = breadth.advancing + breadth.declining + breadth.unchanged;

  const advancingPercentage = total > 0 ? (breadth.advancing / total) * 100 : 0;

  const decliningPercentage = total > 0 ? (breadth.declining / total) * 100 : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="font-semibold">Market Breadth</h2>

      <p className="mt-1 text-sm text-zinc-500">
        Advancing vs declining stocks
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-emerald-500">Advancing</span>

            <span>{breadth.advancing.toLocaleString()}</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${advancingPercentage}%`,
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm">
            <span className="text-red-500">Declining</span>

            <span>{breadth.declining.toLocaleString()}</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-red-500"
              style={{
                width: `${decliningPercentage}%`,
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-zinc-500">
          <span>Unchanged</span>
          <span>{breadth.unchanged}</span>
        </div>
      </div>
    </div>
  );
}
