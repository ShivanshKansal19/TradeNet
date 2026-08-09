import { useQuery } from "@tanstack/react-query";

import { getMarketOverview } from "../api/market";

export function useMarketOverview() {
  return useQuery({
    queryKey: ["market", "overview"],
    queryFn: getMarketOverview,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
