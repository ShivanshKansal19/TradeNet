# Frontend Design

## Technology Stack

The frontend is built with:
- **React**
- **TypeScript**
- **Vite**
- **React Router**
- **TanStack Query** (React Query)

## Migration Strategy

Keep the current Django server-rendered templates while migrating page-by-page. Do not rewrite the entire application in a single change.

## Product Pages

| Page | Main content |
| --- | --- |
| Market overview | NIFTY/Sensex, sector heatmap, top movers, market breadth. |
| Stock detail | Price/volume chart, fundamentals, technical indicators, forecast, news. |
| Compare | Side-by-side comparison of two to four stocks. |
| Screener | Fundamental and technical filters with saved searches. |
| Watchlist | Saved stocks, notable changes, and active alerts. |
| Portfolio | Holdings, allocation, returns, concentration, and benchmark comparison. |

---
[Return to Documentation Index](README.md)
