export interface ScreenerFilters {
  sector: string;
  minMarketCap: number; // in Cr
  minRsi: number;
  maxRsi: number;
  forecastTrend: "all" | "bullish" | "bearish";
  search: string;
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
