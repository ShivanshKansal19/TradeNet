# Architecture & Core Data Flow

## Goal

TradeNet is a stock research and decision-support product for Indian equities.
It provides market data, technical and fundamental analysis, short-horizon
forecasting, watchlists, alerts, stock comparison, and portfolio insights.

It must not present forecasts as certain investment advice. Every forecast
should include its time horizon, confidence range, model version, and
performance against a simple baseline.

## High-Level System Architecture

```mermaid
flowchart TB
    User["User browser"] --> Web["React frontend"]
    Web --> API["Django REST API"]

    API --> DB[("PostgreSQL")]
    API --> Cache[("Redis cache")]
    API --> Auth["Authentication"]

    Scheduler["Celery Beat / cron"] --> Worker["Celery workers"]
    Worker --> Provider["Market-data providers\nYahoo Finance / NSE-compatible provider"]
    Worker --> DB
    Worker --> Forecast["Forecast and validation service"]
    Forecast --> DB
    Worker --> Notify["Email / push notification service"]
```

### Component Responsibilities

| Component | Responsibility |
| --- | --- |
| React | Interactive dashboards, charts, screening, watchlists, and portfolio UI. |
| Django REST API | Authentication, validation, authorization, API responses, and business logic. |
| PostgreSQL | Durable user, market-data, indicator, forecast, and portfolio storage. |
| Redis | Cache frequently requested stock data and queue background work. |
| Celery workers | Fetch data, calculate indicators, create predictions, and send alerts. |
| Scheduler | Starts routine jobs at market-aware times. |

## End-to-End Data Flow

```mermaid
sequenceDiagram
    participant Scheduler
    participant Worker
    participant Provider as Market-data provider
    participant DB as PostgreSQL
    participant API as Django API
    participant UI as React

    Scheduler->>Worker: Run market-close update
    Worker->>Provider: Fetch OHLCV, fundamentals, and index data
    Provider-->>Worker: Normalized market response
    Worker->>DB: Store prices and source metadata
    Worker->>Worker: Calculate technical indicators
    Worker->>Worker: Backtest and generate forecast
    Worker->>DB: Store metrics, forecast, and model version
    UI->>API: Request stock dashboard
    API->>DB: Read latest normalized data
    API-->>UI: Return stock, indicator, and forecast response
```

---
[Return to Documentation Index](README.md)
