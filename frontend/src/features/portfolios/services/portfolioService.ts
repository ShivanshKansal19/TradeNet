import type { Holding, PortfolioSummary } from "../types/portfolio";

const PORTFOLIO_STORAGE_KEY = "tradenet_portfolio_holdings";

const DEFAULT_HOLDINGS: Holding[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    sector: "Energy",
    quantity: 50,
    averageBuyPrice: 1280.00,
    currentPrice: 1420.50,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "Technology",
    quantity: 25,
    averageBuyPrice: 3600.00,
    currentPrice: 3842.20,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd.",
    sector: "Banking",
    quantity: 60,
    averageBuyPrice: 1750.00,
    currentPrice: 1946.30,
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd.",
    sector: "Technology",
    quantity: 40,
    averageBuyPrice: 1480.00,
    currentPrice: 1632.40,
  },
];

export function getSavedHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_HOLDINGS;
  } catch {
    return DEFAULT_HOLDINGS;
  }
}

export function saveHoldings(holdings: Holding[]): void {
  try {
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(holdings));
  } catch (e) {
    console.error("Failed to save portfolio:", e);
  }
}

export function calculatePortfolioSummary(holdings: Holding[]): PortfolioSummary {
  let totalInvested = 0;
  let currentValue = 0;

  holdings.forEach((h) => {
    totalInvested += h.quantity * h.averageBuyPrice;
    currentValue += h.quantity * h.currentPrice;
  });

  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  
  // Approximate today's return at ~1.4%
  const todayPnl = currentValue * 0.0142;
  const todayPnlPercent = 1.42;

  return {
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercent,
    todayPnl,
    todayPnlPercent,
    cashBalance: 45000,
  };
}
