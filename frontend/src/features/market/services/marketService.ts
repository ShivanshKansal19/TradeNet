import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { MarketOverview } from "../types/market";
import { mockMarketOverview } from "../mocks/market";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export async function getMarketOverview(): Promise<MarketOverview> {
  if (USE_MOCK_API) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockMarketOverview);
      }, 500);
    });
  }

  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.MARKET.OVERVIEW);
    const data = response.data;
    if (!data) return mockMarketOverview;

    return {
      timestamp: data.timestamp || new Date().toISOString(),
      market_status: data.market_status || "open",
      indices: Array.isArray(data.indices) && data.indices.length > 0
        ? data.indices.map((idx: any) => ({
            symbol: idx.symbol,
            name: idx.name,
            value: Number(idx.value) || 0,
            change: Number(idx.change) || 0,
            change_percent: Number(idx.change_percent) || 0,
          }))
        : mockMarketOverview.indices,
      breadth: data.breadth || {
        advancing: 1248,
        declining: 584,
        unchanged: 127,
      },
      movers: {
        gainers: (data.movers?.gainers?.length ? data.movers.gainers : (data.top_gainers?.length ? data.top_gainers.map((g: any) => ({
          symbol: g.symbol,
          name: g.name,
          price: Number(g.current_price || g.price || 0),
          change: Number(g.day_change || g.change || 0),
          change_percent: Number(g.day_change_percent || g.change_percent || 0),
        })) : mockMarketOverview.movers.gainers)),
        losers: (data.movers?.losers?.length ? data.movers.losers : (data.top_losers?.length ? data.top_losers.map((l: any) => ({
          symbol: l.symbol,
          name: l.name,
          price: Number(l.current_price || l.price || 0),
          change: Number(l.day_change || l.change || 0),
          change_percent: Number(l.day_change_percent || l.change_percent || 0),
        })) : mockMarketOverview.movers.losers)),
      },
    };
  } catch (error) {
    console.warn("Failed to fetch market overview from backend, falling back to mock:", error);
    return mockMarketOverview;
  }
}

