// src/features/market/components/MarketDashboardSkeleton.tsx

export default function MarketDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
      <div className="h-10 w-64 rounded bg-zinc-800" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-zinc-800/60" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-zinc-800/60" />
        <div className="h-64 rounded-xl bg-zinc-800/60" />
      </div>
    </div>
  );
}
