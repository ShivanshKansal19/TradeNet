import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { Stock, StockSearchResult, TechnicalIndicatorsData } from "../types/stock";
import { MOCK_STOCKS, MOCK_SEARCH_RESULTS, MOCK_TECHNICALS } from "../mocks/stocks";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query.trim()) return [];

  if (USE_MOCK_API) {
    return new Promise((resolve) => {
      const q = query.toLowerCase();
      const results = MOCK_SEARCH_RESULTS.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
      resolve(results);
    });
  }

  try {
    const response = await apiClient.get<StockSearchResult[]>(`${API_ENDPOINTS.STOCKS.SEARCH}?q=${query}`);
    return response.data;
  } catch {
    // Fallback to mock search on network error
    const q = query.toLowerCase();
    return MOCK_SEARCH_RESULTS.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }
}

export async function getStockDetails(symbol: string): Promise<Stock> {
  const sym = symbol.toUpperCase();

  if (USE_MOCK_API) {
    return new Promise((resolve) => {
      resolve(MOCK_STOCKS[sym] || {
        symbol: sym,
        name: `${sym} India Ltd.`,
        series: "EQ",
        isin_number: `INE000${sym}01`,
        sector: "Diversified",
        price: 1540.0,
        change: 12.5,
        change_percent: 0.82,
        day_high: 1560.0,
        day_low: 1525.0,
        year_high: 1780.0,
        year_low: 1200.0,
        volume: 8500000,
        market_cap: 450000,
        pe_ratio: 22.4,
        pb_ratio: 3.5,
        dividend_yield: 1.1,
        eps: 68.7,
      });
    });
  }

  try {
    const response = await apiClient.get<Stock>(API_ENDPOINTS.STOCKS.DETAIL(sym));
    return response.data;
  } catch {
    return MOCK_STOCKS[sym] || {
      symbol: sym,
      name: `${sym} India Ltd.`,
      series: "EQ",
      isin_number: `INE000${sym}01`,
      sector: "Diversified",
      price: 1540.0,
      change: 12.5,
      change_percent: 0.82,
      day_high: 1560.0,
      day_low: 1525.0,
      year_high: 1780.0,
      year_low: 1200.0,
      volume: 8500000,
      market_cap: 450000,
      pe_ratio: 22.4,
      pb_ratio: 3.5,
      dividend_yield: 1.1,
      eps: 68.7,
    };
  }
}

export async function getStockTechnicals(symbol: string): Promise<TechnicalIndicatorsData> {
  const sym = symbol.toUpperCase();
  try {
    const response = await apiClient.get<TechnicalIndicatorsData>(API_ENDPOINTS.TECHNICALS.DETAIL(sym));
    return response.data;
  } catch {
    return MOCK_TECHNICALS[sym] || {
      symbol: sym,
      date: "2026-08-19",
      rsi_14: 55.4,
      rsi_signal: "Neutral",
      macd: 8.2,
      macd_signal: 6.1,
      macd_hist: 2.1,
      macd_trend: "Bullish Crossover",
      sma_20: 1510.0,
      sma_50: 1480.0,
      sma_200: 1420.0,
      trend_summary: "Moderate Uptrend",
    };
  }
}
