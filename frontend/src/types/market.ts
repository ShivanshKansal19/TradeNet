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

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface MarketMovers {
  gainers: MarketMover[];
  losers: MarketMover[];
}

export type MarketStatus = "open" | "closed" | "pre_open" | "post_market";

export interface MarketOverview {
  timestamp: string;
  market_status: MarketStatus;
  indices: MarketIndex[];
  breadth: MarketBreadth;
  movers: MarketMovers;
}
