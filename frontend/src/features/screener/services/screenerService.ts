import type { ScreenerFilters, ScreenerStockItem } from "../types/screener";
import { MOCK_SCREENER_STOCKS } from "../mocks/screener";

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
    if (filters.sector !== "all" && stock.sector !== filters.sector) {
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
