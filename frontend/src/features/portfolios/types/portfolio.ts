export interface PortfolioItem {
  id: number;
  name: string;
  description?: string | null;
  holdings_count: number;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id?: number;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedValue?: number;
  currentValue?: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  weight_percent: number;
}

export interface PortfolioAnalytics {
  portfolio_id: number;
  portfolio_name: string;
  total_invested: number;
  total_investment?: number;
  total_current_value: number;
  current_value?: number;
  total_pnl: number;
  total_return_percent: number;
  day_pnl?: number;
  day_pnl_percent?: number;
  holdings_count: number;
  sector_allocations: SectorAllocation[];
  sector_allocation?: SectorAllocation[];
  benchmark_comparison?: {
    benchmark_name: string;
    benchmark_return_percent: number;
    portfolio_return_percent: number;
    alpha: number;
  };
  holdings: Array<{
    id: number;
    symbol: string;
    name: string;
    sector: string;
    quantity: number;
    average_buy_price: number;
    current_price: number;
    invested_value: number;
    current_value: number;
    pnl: number;
    pnl_percent: number;
    day_pnl?: number;
    day_pnl_percent?: number;
  }>;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  todayPnl: number;
  todayPnlPercent: number;
  cashBalance: number;
}

export interface CreatePortfolioInput {
  name: string;
  description?: string;
}

export interface UpdatePortfolioInput {
  name?: string;
  description?: string;
}

export interface AddHoldingInput {
  symbol?: string;
  stock_id?: number;
  quantity: number;
  average_buy_price: number;
}
