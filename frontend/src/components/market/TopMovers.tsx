import type { MarketMover } from "../../types/market";

interface TopMoversProps {
  gainers: MarketMover[];
  losers: MarketMover[];
}

function MoverRow({ mover }: { mover: MarketMover }) {
  const positive = mover.change_percent >= 0;

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium">{mover.symbol}</p>

        <p className="text-xs text-zinc-500">{mover.name}</p>
      </div>

      <div className="text-right">
        <p className="text-sm">
          ₹
          {mover.price.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </p>

        <p
          className={`text-xs ${
            positive ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {positive ? "+" : ""}
          {mover.change_percent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

export default function TopMovers({ gainers, losers }: TopMoversProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div>
        <h2 className="font-semibold">Top Movers</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Today's biggest price movements
        </p>
      </div>

      <div className="mt-5">
        {gainers.slice(0, 5).map((mover) => (
          <MoverRow key={mover.symbol} mover={mover} />
        ))}
      </div>
    </div>
  );
}
