import apiClient from "../../../api/client";
import type { ScreenerFilters, ScreenerStockItem } from "../types/screener";
import { MOCK_SCREENER_STOCKS } from "../mocks/screener";

export async function fetchScreenerStocks(): Promise<ScreenerStockItem[]> {
  try {
    const response = await apiClient.get<any[]>("/api/v1/stocks/");
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        sector: item.sector || "Diversified",
        price: item.price || 1000,
        change_percent: item.change_percent || 0.0,
        market_cap: item.market_cap || 50000,
        pe_ratio: item.pe_ratio || 22.0,
        rsi: 58.4,
        forecast_5d_pct: 2.1,
        forecast_prob: 64,
      }));
    }
  } catch (e) {
    console.warn("Failed to fetch live screener stocks from backend:", e);
  }
  return MOCK_SCREENER_STOCKS;
}

export function filterScreenerStocks(stocks: ScreenerStockItem[], filters: ScreenerFilters): ScreenerStockItem[] {
  return stocks.filter((stock) => {
    // Search query filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!stock.symbol.toLowerCase().includes(q) && !stock.name.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Sector filter
    if (filters.sector !== "all" && !stock.sector.toLowerCase().includes(filters.sector.toLowerCase())) {
      return false;
    }

    // Market Cap filter
    if (stock.market_cap < filters.minMarketCap) {
      return false;
    }

    // RSI range filter
    if (stock.rsi < filters.minRsi || stock.rsi > filters.maxRsi) {
      return false;
    }

    // Forecast Trend filter
    if (filters.forecastTrend === "bullish" && stock.forecast_5d_pct <= 0) {
      return false;
    }
    if (filters.forecastTrend === "bearish" && stock.forecast_5d_pct >= 0) {
      return false;
    }

    return true;
  });
}
