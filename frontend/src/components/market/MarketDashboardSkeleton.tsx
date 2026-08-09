import Skeleton from "../common/Skeleton";

export default function MarketDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Indices */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-5 h-8 w-36" />
            <Skeleton className="mt-3 h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-8 h-3 w-full" />
          <Skeleton className="mt-8 h-3 w-4/5" />
          <Skeleton className="mt-8 h-3 w-3/5" />
        </div>

        <div className="h-80 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <Skeleton className="h-5 w-32" />

          <div className="mt-6 space-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
