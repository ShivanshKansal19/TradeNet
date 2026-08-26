export type MarketCapCategory = "all" | "large" | "mid" | "small";
export type PeCategory = "all" | "value" | "fair" | "growth";
export type PricePerformance = "all" | "gainers" | "losers" | "big_gainers";
export type ForecastTrend = "all" | "bullish" | "bearish";

export interface ScreenerFilters {
  search: string;
  sector: string;
  marketCapCategory: MarketCapCategory;
  minMarketCap: number; // in Cr
  peCategory: PeCategory;
  pricePerformance: PricePerformance;
  minRsi: number;
  maxRsi: number;
  forecastTrend: ForecastTrend;
  minForecastProb: number;
}

export interface ScreenerStockItem {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change_percent: number;
  market_cap: number; // Cr
  pe_ratio: number;
  rsi: number;
  forecast_5d_pct: number;
  forecast_prob: number;
}
