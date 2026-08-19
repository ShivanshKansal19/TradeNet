import { useQuery } from "@tanstack/react-query";
import { searchStocks } from "../services/stockService";

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ["stockSearch", query],
    queryFn: () => searchStocks(query),
    enabled: query.trim().length >= 1,
    staleTime: 60000,
  });
}
