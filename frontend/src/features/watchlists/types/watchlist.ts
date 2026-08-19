export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  rsi: number;
  forecast_5d_pct: number;
  forecast_prob: number;
  sparkline: number[];
}

export interface WatchlistGroup {
  id: string;
  name: string;
  items: WatchlistItem[];
}

export interface StockAlert {
  id: string;
  symbol: string;
  condition: "PRICE_ABOVE" | "PRICE_BELOW" | "RSI_OVERBOUGHT" | "RSI_OVERSOLD";
  thresholdValue: number;
  isActive: boolean;
  createdAt: string;
}
