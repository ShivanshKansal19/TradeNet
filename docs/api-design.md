# API Design

## Overview & Conventions

- All new endpoints should be versioned under `/api/v1/`.
- All responses must return predictable JSON.
- Protect user-specific endpoints with authentication.

## Route Catalog

```text
GET  /api/v1/stocks/search?q=reliance
GET  /api/v1/stocks/{symbol}
GET  /api/v1/stocks/{symbol}/history?range=1y
GET  /api/v1/stocks/{symbol}/technicals
GET  /api/v1/stocks/{symbol}/fundamentals
GET  /api/v1/stocks/{symbol}/forecast?horizon=5d
GET  /api/v1/market/overview
GET  /api/v1/market/sectors
GET  /api/v1/watchlists
POST /api/v1/watchlists
POST /api/v1/alerts
GET  /api/v1/portfolios
```

---
[Return to Documentation Index](README.md)
