import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { Stock, StockSearchResult, TechnicalIndicatorsData } from "../types/stock";
import { MOCK_STOCKS, MOCK_SEARCH_RESULTS, MOCK_TECHNICALS } from "../mocks/stocks";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export function normalizeStockData(data: any, sym: string): Stock {
  const fallback = MOCK_STOCKS[sym] || {
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

  if (!data) return fallback;

  const fundamentals = data.fundamentals || {};
  const currentPrice = Number(data.price ?? data.current_price ?? fallback.price);
  const dayChange = Number(data.change ?? data.day_change ?? fallback.change);
  const dayChangePct = Number(data.change_percent ?? data.day_change_percent ?? fallback.change_percent);

  return {
    symbol: data.symbol || sym,
    name: data.name || fallback.name,
    series: data.series || "EQ",
    isin_number: data.isin_number || fallback.isin_number || `INE000${sym}01`,
    sector: data.sector || fallback.sector || "Diversified",
    price: currentPrice,
    change: dayChange,
    change_percent: dayChangePct,
    day_high: Number(data.day_high ?? (currentPrice * 1.015)),
    day_low: Number(data.day_low ?? (currentPrice * 0.985)),
    year_high: Number(data.year_high ?? fundamentals.week_52_high ?? (currentPrice * 1.25)),
    year_low: Number(data.year_low ?? fundamentals.week_52_low ?? (currentPrice * 0.75)),
    volume: Number(data.volume ?? 8500000),
    market_cap: Number(data.market_cap ?? fundamentals.market_cap ?? fallback.market_cap ?? 450000),
    pe_ratio: Number(data.pe_ratio ?? fundamentals.pe_ratio ?? fallback.pe_ratio ?? 22.4),
    pb_ratio: Number(data.pb_ratio ?? fundamentals.pb_ratio ?? fallback.pb_ratio ?? 3.5),
    dividend_yield: Number(data.dividend_yield ?? fundamentals.dividend_yield ?? fallback.dividend_yield ?? 1.1),
    eps: Number(data.eps ?? fundamentals.eps ?? fallback.eps ?? 68.7),
  };
}

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
    const response = await apiClient.get<any>(`${API_ENDPOINTS.STOCKS.SEARCH}?q=${query}`);
    const items = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    if (items.length > 0) {
      return items.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        sector: item.sector,
        price: Number(item.price ?? item.current_price ?? 1000),
        change_percent: Number(item.change_percent ?? item.day_change_percent ?? 0),
      }));
    }
  } catch {
    // Fallback to mock search
  }

  const q = query.toLowerCase();
  return MOCK_SEARCH_RESULTS.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );
}

export async function getStockDetails(symbol: string): Promise<Stock> {
  const sym = symbol.toUpperCase();

  if (USE_MOCK_API) {
    return new Promise((resolve) => {
      resolve(normalizeStockData(MOCK_STOCKS[sym], sym));
    });
  }

  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.STOCKS.DETAIL(sym));
    return normalizeStockData(response.data, sym);
  } catch {
    return normalizeStockData(MOCK_STOCKS[sym], sym);
  }
}

export async function getStockTechnicals(symbol: string): Promise<TechnicalIndicatorsData> {
  const sym = symbol.toUpperCase();
  const fallback = MOCK_TECHNICALS[sym] || {
    symbol: sym,
    date: new Date().toISOString().split("T")[0],
    rsi_14: 55.4,
    rsi_signal: "Neutral" as const,
    macd: 8.2,
    macd_signal: 6.1,
    macd_hist: 2.1,
    macd_trend: "Bullish Crossover" as const,
    sma_20: 1510.0,
    sma_50: 1480.0,
    sma_200: 1420.0,
    trend_summary: "Moderate Uptrend" as const,
  };

  if (USE_MOCK_API) {
    return new Promise((resolve) => resolve(fallback));
  }

  try {
    const response = await apiClient.get<any>(API_ENDPOINTS.TECHNICALS.DETAIL(sym));
    const raw = response.data?.latest || response.data;
    if (!raw) return fallback;

    return {
      symbol: raw.symbol || sym,
      date: raw.date || raw.last_updated || fallback.date,
      rsi_14: Number(raw.rsi_14 ?? raw.rsi_value ?? fallback.rsi_14),
      rsi_signal: raw.rsi_signal || (raw.rsi_14 > 70 ? "Overbought" : raw.rsi_14 < 30 ? "Oversold" : "Neutral"),
      macd: Number(raw.macd ?? raw.macd_line ?? fallback.macd),
      macd_signal: Number(raw.macd_signal ?? fallback.macd_signal),
      macd_hist: Number(raw.macd_hist ?? raw.macd_histogram ?? fallback.macd_hist),
      macd_trend: raw.macd_trend || (raw.macd > raw.macd_signal ? "Bullish Crossover" : "Neutral"),
      sma_20: Number(raw.sma_20 ?? fallback.sma_20),
      sma_50: Number(raw.sma_50 ?? fallback.sma_50),
      sma_200: Number(raw.sma_200 ?? fallback.sma_200),
      trend_summary: raw.trend_summary || fallback.trend_summary,
    };
  } catch {
    return fallback;
  }
}
