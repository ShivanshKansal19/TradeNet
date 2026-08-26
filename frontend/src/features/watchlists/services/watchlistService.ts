import type { WatchlistGroup, StockAlert } from "../types/watchlist";

const STORAGE_KEY = "tradenet_watchlists";
const ALERTS_KEY = "tradenet_alerts";

const DEFAULT_WATCHLISTS: WatchlistGroup[] = [
  {
    id: "core",
    name: "Core Watchlist",
    items: [
      {
        symbol: "RELIANCE",
        name: "Reliance Industries",
        price: 1420.50,
        change: 39.25,
        change_percent: 2.84,
        rsi: 62.4,
        forecast_5d_pct: 2.4,
        forecast_prob: 64,
        sparkline: [1370, 1385, 1390, 1380, 1405, 1420],
      },
      {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        price: 3842.20,
        change: 86.75,
        change_percent: 2.31,
        rsi: 58.1,
        forecast_5d_pct: 2.1,
        forecast_prob: 62,
        sparkline: [3720, 3750, 3740, 3780, 3810, 3842],
      },
      {
        symbol: "INFY",
        name: "Infosys Ltd.",
        price: 1632.40,
        change: 21.80,
        change_percent: 1.35,
        rsi: 54.2,
        forecast_5d_pct: 1.8,
        forecast_prob: 59,
        sparkline: [1590, 1605, 1610, 1625, 1620, 1632],
      },
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd.",
        price: 1946.30,
        change: -23.85,
        change_percent: -1.21,
        rsi: 42.6,
        forecast_5d_pct: 0.9,
        forecast_prob: 55,
        sparkline: [1980, 1970, 1965, 1955, 1950, 1946],
      },
    ],
  },
  {
    id: "growth",
    name: "Growth & EV",
    items: [
      {
        symbol: "TATAMOTORS",
        name: "Tata Motors Ltd.",
        price: 890.50,
        change: 14.20,
        change_percent: 1.62,
        rsi: 51.3,
        forecast_5d_pct: 1.5,
        forecast_prob: 58,
        sparkline: [860, 875, 870, 882, 885, 890],
      },
    ],
  },
];

export function getSavedWatchlists(): WatchlistGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_WATCHLISTS;
  } catch {
    return DEFAULT_WATCHLISTS;
  }
}

export function saveWatchlists(groups: WatchlistGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error("Failed to save watchlists:", e);
  }
}

export function getSavedAlerts(): StockAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: StockAlert[]): void {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error("Failed to save alerts:", e);
  }
}
