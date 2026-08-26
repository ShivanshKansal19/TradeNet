import { useQuery } from "@tanstack/react-query";
import { getStockPriceHistory } from "../services/stockService";

export function useStockPriceHistory(symbol: string, range: string = "1Y") {
  return useQuery({
    queryKey: ["stockHistory", symbol?.toUpperCase(), range],
    queryFn: () => getStockPriceHistory(symbol, range),
    enabled: Boolean(symbol),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
