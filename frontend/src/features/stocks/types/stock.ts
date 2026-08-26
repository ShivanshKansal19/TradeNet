export interface Stock {
  symbol: string;
  name: string;
  series: string;
  date_of_listing?: string;
  isin_number: string;
  sector?: string;
  price: number;
  change: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  year_high: number;
  year_low: number;
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  dividend_yield?: number;
  eps?: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  sector?: string;
  price: number;
  change_percent: number;
}

export interface TechnicalIndicatorsData {
  symbol: string;
  date: string;
  rsi_14: number;
  rsi_signal: "Overbought" | "Oversold" | "Neutral";
  macd: number;
  macd_signal: number;
  macd_hist: number;
  macd_trend: "Bullish Crossover" | "Bearish Crossover" | "Neutral";
  sma_20: number;
  sma_50: number;
  sma_200: number;
  trend_summary: "Strong Uptrend" | "Moderate Uptrend" | "Downtrend" | "Consolidating";
}
