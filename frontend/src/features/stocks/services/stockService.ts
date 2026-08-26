import apiClient from "../../../api/client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type { Stock, StockSearchResult, TechnicalIndicatorsData } from "../types/stock";
import { MOCK_STOCKS, MOCK_SEARCH_RESULTS, MOCK_TECHNICALS } from "../mocks/stocks";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export function normalizeStockData(data: any, sym: string): Stock {
  if (!data) {
    return {
      symbol: sym,
      name: `${sym} Limited`,
      series: "EQ",
      isin_number: `INE000${sym}01`,
      sector: "Diversified",
      price: 0,
      change: 0,
      change_percent: 0,
      day_high: 0,
      day_low: 0,
      year_high: 0,
      year_low: 0,
      volume: 0,
      market_cap: 0,
      pe_ratio: 0,
      pb_ratio: 0,
      dividend_yield: 0,
      eps: 0,
    };
  }

  const fundamentals = data.fundamentals || {};
  const currentPrice = Number(data.price ?? data.current_price ?? 0);
  const dayChange = Number(data.change ?? data.day_change ?? 0);
  const dayChangePct = Number(data.change_percent ?? data.day_change_percent ?? 0);

  const yHigh = Number(fundamentals.week_52_high ?? data.year_high ?? (currentPrice > 0 ? currentPrice * 1.15 : 0));
  const yLow = Number(fundamentals.week_52_low ?? data.year_low ?? (currentPrice > 0 ? currentPrice * 0.85 : 0));

  return {
    symbol: data.symbol || sym,
    name: data.name || sym,
    series: data.series || "EQ",
    isin_number: data.isin_number || `INE000${sym}01`,
    sector: data.sector || "Diversified",
    price: currentPrice,
    change: dayChange,
    change_percent: dayChangePct,
    day_high: Number(data.day_high ?? (currentPrice > 0 ? currentPrice * 1.01 : 0)),
    day_low: Number(data.day_low ?? (currentPrice > 0 ? currentPrice * 0.99 : 0)),
    year_high: yHigh,
    year_low: yLow,
    volume: Number(data.volume ?? data.latest_price?.volume ?? 0),
    market_cap: Number(data.market_cap ?? fundamentals.market_cap ?? 0),
    pe_ratio: Number(fundamentals.pe_ratio ?? data.pe_ratio ?? 0),
    pb_ratio: Number(fundamentals.pb_ratio ?? data.pb_ratio ?? 0),
    dividend_yield: Number(fundamentals.dividend_yield ?? data.dividend_yield ?? 0),
    eps: Number(fundamentals.eps ?? data.eps ?? 0),
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

export async function getStockPriceHistory(
  symbol: string,
  range: string = "1y"
): Promise<{ date: string; open: number; high: number; low: number; close: number; price: number; volume: number }[]> {
  const sym = symbol.toUpperCase();
  try {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.STOCKS.HISTORY(sym)}?range=${range.toLowerCase()}`
    );
    const rawList = response.data?.prices || (Array.isArray(response.data) ? response.data : []);
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((p: any) => {
        const close = Number(p.close_price ?? p.close ?? p.price ?? 0);
        return {
          date: p.date || "",
          open: Number(p.open_price ?? p.open ?? close),
          high: Number(p.high_price ?? p.high ?? close),
          low: Number(p.low_price ?? p.low ?? close),
          close: close,
          price: close,
          volume: Number(p.volume ?? 0),
        };
      });
    }
  } catch (err) {
    console.error(`Failed to fetch history for ${sym}:`, err);
  }
  return [];
}
