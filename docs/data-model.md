# Data Model

## Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ WATCHLISTS : owns
    WATCHLISTS ||--o{ WATCHLIST_ITEMS : contains
    STOCKS ||--o{ WATCHLIST_ITEMS : saved_as
    STOCKS ||--o{ STOCK_PRICES : has
    STOCKS ||--o{ TECHNICAL_INDICATORS : has
    STOCKS ||--o{ FORECASTS : receives
    FORECAST_RUNS ||--o{ FORECASTS : generates
    USERS ||--o{ PORTFOLIOS : owns
    PORTFOLIOS ||--o{ PORTFOLIO_HOLDINGS : contains
    STOCKS ||--o{ PORTFOLIO_HOLDINGS : held_as
```

## Core Tables

```text
users
stocks
stock_prices
stock_fundamentals
technical_indicators
market_indices
sector_performance
forecast_runs
forecasts
watchlists
watchlist_items
alerts
portfolios
portfolio_holdings
transactions
news_items
```

## Data Management Guidelines

- Keep `stock_prices` immutable after ingestion when possible.
- Record provider, retrieval time, and adjustment status so forecasts can be reliably reproduced.

---
[Return to Documentation Index](README.md)
