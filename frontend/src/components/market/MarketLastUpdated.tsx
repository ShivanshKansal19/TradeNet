interface MarketLastUpdatedProps {
  timestamp: string;
}

export default function MarketLastUpdated({
  timestamp,
}: MarketLastUpdatedProps) {
  const date = new Date(timestamp);

  return (
    <p className="text-xs text-zinc-500">
      Last updated{" "}
      {date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </p>
  );
}
