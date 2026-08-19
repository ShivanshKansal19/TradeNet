import { useQuery } from "@tanstack/react-query";
import { getStockForecast } from "../services/forecastService";
import type { HorizonDays } from "../types/forecast";

export function useStockForecast(symbol: string, horizon: HorizonDays = 5, currentPrice: number = 1420.5) {
  return useQuery({
    queryKey: ["stockForecast", symbol, horizon, currentPrice],
    queryFn: () => getStockForecast(symbol, horizon, currentPrice),
    enabled: !!symbol,
    staleTime: 60000,
  });
}
