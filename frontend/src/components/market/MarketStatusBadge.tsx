import type { MarketStatus } from "../../types/market";

interface MarketStatusBadgeProps {
  status: MarketStatus;
}

const labels: Record<MarketStatus, string> = {
  open: "Market Open",
  closed: "Market Closed",
  pre_open: "Pre-Open",
  post_market: "Post-Market",
};

export default function MarketStatusBadge({ status }: MarketStatusBadgeProps) {
  const isOpen = status === "open";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${
          isOpen ? "bg-emerald-500" : "bg-zinc-500"
        }`}
      />

      <span className="text-zinc-400">{labels[status]}</span>
    </div>
  );
}
