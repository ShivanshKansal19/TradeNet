import apiClient from "./client";
import type { MarketOverview } from "../types/market";
import { mockMarketOverview } from "./mocks/market";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export async function getMarketOverview(): Promise<MarketOverview> {
  if (USE_MOCK_API) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockMarketOverview);
      }, 500);
    });
  }

  const response = await apiClient.get<MarketOverview>("/market/overview/");

  return response.data;
}
