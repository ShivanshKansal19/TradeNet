import { useQuery } from "@tanstack/react-query";
import { getStockDetails, getStockTechnicals } from "../services/stockService";

export function useStockDetails(symbol: string) {
  return useQuery({
    queryKey: ["stockDetails", symbol],
    queryFn: () => getStockDetails(symbol),
    enabled: !!symbol,
    staleTime: 30000,
  });
}

export function useStockTechnicals(symbol: string) {
  return useQuery({
    queryKey: ["stockTechnicals", symbol],
    queryFn: () => getStockTechnicals(symbol),
    enabled: !!symbol,
    staleTime: 60000,
  });
}
