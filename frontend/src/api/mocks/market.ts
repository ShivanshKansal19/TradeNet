import type { MarketOverview } from "../../types/market";

export const mockMarketOverview: MarketOverview = {
  timestamp: "2026-08-09T15:30:00+05:30",

  market_status: "closed",

  indices: [
    {
      symbol: "NIFTY50",
      name: "NIFTY 50",
      value: 24363.3,
      change: 198.42,
      change_percent: 0.82,
    },
    {
      symbol: "SENSEX",
      name: "SENSEX",
      value: 80976.55,
      change: 490.12,
      change_percent: 0.61,
    },
    {
      symbol: "NIFTYBANK",
      name: "NIFTY Bank",
      value: 55214.2,
      change: -132.42,
      change_percent: -0.24,
    },
  ],

  breadth: {
    advancing: 1248,
    declining: 584,
    unchanged: 127,
  },

  movers: {
    gainers: [
      {
        symbol: "RELIANCE",
        name: "Reliance Industries",
        price: 1420.5,
        change: 39.25,
        change_percent: 2.84,
      },
      {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        price: 3842.2,
        change: 86.75,
        change_percent: 2.31,
      },
      {
        symbol: "ICICIBANK",
        name: "ICICI Bank",
        price: 1325.4,
        change: 26.1,
        change_percent: 2.01,
      },
      {
        symbol: "MARUTI",
        name: "Maruti Suzuki",
        price: 12480.3,
        change: 219.4,
        change_percent: 1.79,
      },
      {
        symbol: "INFY",
        name: "Infosys",
        price: 1632.4,
        change: 21.8,
        change_percent: 1.35,
      },
    ],

    losers: [
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank",
        price: 1946.3,
        change: -23.85,
        change_percent: -1.21,
      },
      {
        symbol: "SBIN",
        name: "State Bank of India",
        price: 812.45,
        change: -8.62,
        change_percent: -1.05,
      },
      {
        symbol: "ITC",
        name: "ITC Limited",
        price: 418.2,
        change: -3.91,
        change_percent: -0.93,
      },
      {
        symbol: "AXISBANK",
        name: "Axis Bank",
        price: 1176.6,
        change: -8.44,
        change_percent: -0.71,
      },
      {
        symbol: "LT",
        name: "Larsen & Toubro",
        price: 3621.8,
        change: -21.15,
        change_percent: -0.58,
      },
    ],
  },
};
