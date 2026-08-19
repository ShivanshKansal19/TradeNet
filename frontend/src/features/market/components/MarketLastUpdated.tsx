// src/features/market/components/MarketLastUpdated.tsx

interface Props {
  timestamp: string;
}

export default function MarketLastUpdated({ timestamp }: Props) {
  const date = new Date(timestamp);
  const formatted = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return <span className="text-xs text-zinc-500">Updated: {formatted}</span>;
}
