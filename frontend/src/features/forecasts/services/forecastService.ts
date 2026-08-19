import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { StockForecast, HorizonDays } from "../types/forecast";
import { generateMockForecast } from "../mocks/forecasts";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export async function getStockForecast(symbol: string, horizon: HorizonDays = 5, currentPrice: number = 1420.5): Promise<StockForecast> {
  const sym = symbol.toUpperCase();

  if (USE_MOCK_API) {
    return new Promise((resolve) => {
      resolve(generateMockForecast(sym, horizon, currentPrice));
    });
  }

  try {
    const response = await apiClient.get<StockForecast>(`${API_ENDPOINTS.FORECASTS.DETAIL(sym)}?horizon=${horizon}d`);
    return response.data;
  } catch {
    return generateMockForecast(sym, horizon, currentPrice);
  }
}
