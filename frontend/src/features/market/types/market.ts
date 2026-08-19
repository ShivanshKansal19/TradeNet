export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  change_percent: number;
}

export interface MarketBreadth {
  advancing: number;
  declining: number;
  unchanged: number;
}

export interface StockMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
}

export interface MarketMovers {
  gainers: StockMover[];
  losers: StockMover[];
}

export interface MarketOverview {
  timestamp: string;
  market_status: "open" | "closed";
  indices: MarketIndex[];
  breadth: MarketBreadth;
  movers: MarketMovers;
}
