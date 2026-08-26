import { useQuery } from "@tanstack/react-query";
import { getMarketOverview } from "../services/marketService";

export function useMarketOverview() {
  return useQuery({
    queryKey: ["marketOverview"],
    queryFn: getMarketOverview,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
