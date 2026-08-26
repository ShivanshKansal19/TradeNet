// src/features/market/components/MarketStatusBadge.tsx

interface Props {
  status: "open" | "closed";
}

export default function MarketStatusBadge({ status }: Props) {
  const isOpen = status === "open";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"}`} />
      {isOpen ? "Market Open" : "Market Closed"}
    </span>
  );
}
