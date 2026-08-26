export const API_ENDPOINTS = {
  STOCKS: {
    LIST: "/api/v1/stocks/",
    SEARCH: "/api/v1/stocks/search",
    DETAIL: (symbol: string) => `/api/v1/stocks/${symbol}`,
    HISTORY: (symbol: string) => `/api/v1/stocks/${symbol}/history`,
    FUNDAMENTALS: (symbol: string) => `/api/v1/stocks/${symbol}/fundamentals`,
  },
  MARKET: {
    OVERVIEW: "/api/v1/market/overview",
    SECTORS: "/api/v1/market/sectors",
  },
  TECHNICALS: {
    DETAIL: (symbol: string) => `/api/v1/stocks/${symbol}/technicals`,
  },
  FORECASTS: {
    DETAIL: (symbol: string) => `/api/v1/stocks/${symbol}/forecast`,
  },
  WATCHLISTS: {
    LIST: "/api/v1/watchlists/",
    DETAIL: (id: string) => `/api/v1/watchlists/${id}`,
  },
  ALERTS: {
    LIST: "/api/v1/alerts/",
  },
  PORTFOLIOS: {
    LIST: "/api/v1/portfolios/",
  },
};
