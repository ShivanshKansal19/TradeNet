# Recommended Project File Structure

This document outlines the recommended file and directory organization for TradeNet. It transitions the codebase from an early-stage monolithic Django setup into a modular, production-ready full-stack architecture tailored for real-time market data, background workers, and ML forecasting.

---

## 1. Architectural Overview & Philosophy

The proposed structure adheres to the following principles:
- **Separation of Concerns:** Clear boundaries between backend API, background workers, ML prediction pipeline, and the React frontend.
- **Domain-Driven Modular Apps:** Splitting the monolithic `baseapp` into distinct Django domain apps (`stocks`, `market_data`, `forecasts`, `portfolios`, `alerts`, `users`).
- **Feature-Based Frontend:** Grouping UI components, hooks, and API queries by product feature for scalability and maintainability.
- **Clean Pipeline Isolation:** Keeping ML model training, feature generation, and walk-forward validation decoupled from HTTP request/response lifecycles.

---

## 2. Complete Target Directory Tree

```text
TradeNet/
├── .github/                           # CI/CD workflows and GitHub actions
│   └── workflows/
│       ├── backend-ci.yml             # Backend tests, linting, formatting
│       └── frontend-ci.yml            # Frontend build, linting, type checks
│
├── docs/                              # Architecture and system design documentation
│   ├── README.md                      # Documentation index
│   ├── architecture.md               # Core system architecture & data flow
│   ├── project-structure.md          # Suggested file structure (this file)
│   ├── frontend-design.md            # React tech stack & UI overview
│   ├── api-design.md                 # REST API conventions & route catalog
│   ├── data-model.md                 # Database schema & ER diagram
│   ├── prediction-system.md          # Forecast engine & validation pipeline
│   ├── background-jobs.md            # Celery worker schedules & idempotency
│   ├── security-and-reliability.md   # Security, caching, and failover
│   └── deployment-and-roadmap.md     # Deployment & 7-stage roadmap
│
├── backend/                           # Django Backend & API Services
│   ├── manage.py                      # Django management script
│   ├── requirements/                  # Modular Python dependency specifications
│   │   ├── base.txt                   # Shared dependencies (Django, DRF, etc.)
│   │   ├── local.txt                  # Dev/testing tools (pytest, black, flake8)
│   │   └── production.txt             # Prod dependencies (gunicorn, psycopg2, redis)
│   │
│   ├── config/                        # Django project configuration (renamed from TradeNet)
│   │   ├── __init__.py                # Celery app export
│   │   ├── asgi.py                    # ASGI config for websockets / async
│   │   ├── celery.py                  # Celery application & schedule settings
│   │   ├── settings/                  # Environment-specific settings
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Common settings
│   │   │   ├── local.py               # Development settings (SQLite / local PostgreSQL)
│   │   │   └── production.py          # Production settings (SSL, Redis cache, PostgreSQL)
│   │   ├── urls.py                    # Master URL router (routes to /api/v1/...)
│   │   └── wsgi.py                    # WSGI config for Gunicorn/Render
│   │
│   ├── apps/                          # Modular Django Domain Applications
│   │   ├── authentication/            # User auth, JWT/session management, profiles
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   │
│   │   ├── stocks/                    # Stock search, profile, history, fundamentals
│   │   │   ├── models.py              # Stock, StockPrice, StockFundamental
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── services/              # Stock metrics computation & queries
│   │   │
│   │   ├── market_data/               # Market overview, indices, sectors, movers
│   │   │   ├── models.py              # MarketIndex, SectorPerformance
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── providers/             # External market data ingestion adapters
│   │   │       ├── base.py            # Abstract data provider interface
│   │   │       ├── yahoo_finance.py   # Yahoo Finance adapter
│   │   │       └── nse_provider.py    # NSE / Indian market API adapter
│   │   │
│   │   ├── technicals/                # Technical indicators computation & signals
│   │   │   ├── models.py              # TechnicalIndicator
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── indicators.py          # RSI, MACD, Moving Averages, ATR calculations
│   │   │
│   │   ├── forecasts/                 # Prediction delivery & forecast tracking
│   │   │   ├── models.py              # ForecastRun, Forecast
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   │
│   │   ├── watchlists/                # User watchlists & saved stock tracking
│   │   │   ├── models.py              # Watchlist, WatchlistItem
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   │
│   │   ├── alerts/                    # Price, volume & technical alert triggers
│   │   │   ├── models.py              # Alert, AlertNotification
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── notifications/         # Email / Push notification dispatcher
│   │   │
│   │   └── portfolios/                # Portfolio management, holdings & analytics
│   │       ├── models.py              # Portfolio, PortfolioHolding, Transaction
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       └── analytics.py           # Returns, allocation & benchmark calculation
│   │
│   ├── tasks/                         # Celery Background Workers & Scheduled Jobs
│   │   ├── data_ingestion.py          # Market-hour quote sync & daily EOD sync
│   │   ├── indicator_calculation.py   # Batch computation of technical indicators
│   │   ├── forecast_generation.py     # Automated batch prediction runs
│   │   └── alert_evaluator.py         # Periodic evaluation of active alert conditions
│   │
│   ├── ml/                            # Machine Learning & Quantitative Research Engine
│   │   ├── __init__.py
│   │   ├── features/                  # Time-safe feature extraction (no look-ahead)
│   │   │   ├── price_returns.py
│   │   │   ├── technical_features.py
│   │   │   └── macro_features.py
│   │   ├── models/                    # Prediction model implementations
│   │   │   ├── baseline.py            # Last-price / naive benchmark model
│   │   │   ├── prophet_model.py       # Time-series Prophet model
│   │   │   └── ensemble.py            # Directional / classification models
│   │   ├── validation/                # Walk-forward testing & metric calculation
│   │   │   ├── walk_forward.py        # Expanding/rolling window backtester
│   │   │   └── metrics.py             # MAE, Directional Accuracy, Calibration
│   │   └── pipeline.py                # Pipeline runner for training and batch inference
│   │
│   └── tests/                         # Backend test suite
│       ├── unit/                      # Unit tests for models, serializers, indicators
│       ├── integration/               # API endpoint & database integration tests
│       └── ml/                        # Tests for feature extraction & time-safety
│
├── frontend/                          # React + TypeScript + Vite Application
│   ├── public/                        # Static assets (favicons, manifest, public SVGs)
│   ├── src/
│   │   ├── main.tsx                   # Application entry point
│   │   ├── App.tsx                    # Root provider setup (QueryClient, Auth, Theme)
│   │   ├── index.css                  # Global styles & design system tokens
│   │   │
│   │   ├── api/                       # HTTP client & generic API configuration
│   │   │   ├── client.ts              # Axios/Fetch client with interceptors & auth
│   │   │   └── endpoints.ts           # Centralized API URL constants
│   │   │
│   │   ├── types/                     # Shared TypeScript interfaces & types
│   │   │   ├── stock.ts               # Stock, Price, Indicator interfaces
│   │   │   ├── forecast.ts            # Forecast, Confidence, Horizon interfaces
│   │   │   ├── portfolio.ts           # Portfolio, Holding, Transaction interfaces
│   │   │   └── market.ts              # MarketOverview, Sector, Index interfaces
│   │   │
│   │   ├── components/                # Shared / Generic UI Components
│   │   │   ├── ui/                    # Base design system primitives (Buttons, Badges, Modals)
│   │   │   ├── charts/                # Interactive charts (Candlestick, Area, Bar)
│   │   │   ├── feedback/              # Loaders, ErrorBoundaries, EmptyStates
│   │   │   └── navigation/            # Header, Sidebar, Footer, Breadcrumbs
│   │   │
│   │   ├── layouts/                   # Page Shell Layouts
│   │   │   ├── RootLayout.tsx         # Main layout with navigation & toast container
│   │   │   └── AuthLayout.tsx         # Layout for login, register, reset-password
│   │   │
│   │   ├── features/                  # Domain-Specific Feature Modules
│   │   │   ├── market/                # Market Overview & Sector Heatmaps
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/             # useMarketOverview(), useSectorPerformance()
│   │   │   │   └── services/          # Market API calls
│   │   │   │
│   │   │   ├── stocks/                # Stock Detail, Historical Charts & Indicators
│   │   │   │   ├── components/        # StockHeader, TechnicalSummary, ChartViewer
│   │   │   │   ├── hooks/             # useStockDetails(), useStockHistory()
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── forecasts/             # Prediction cards, Confidence Gauges & Metrics
│   │   │   │   ├── components/        # ForecastCard, AccuracyBadge, HorizonPicker
│   │   │   │   ├── hooks/             # useStockForecast()
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── compare/               # Multi-Stock Comparison Engine
│   │   │   │   ├── components/        # CompareTable, OverlayChart
│   │   │   │   └── hooks/             # useCompareStocks()
│   │   │   │
│   │   │   ├── screener/              # Technical & Fundamental Stock Screener
│   │   │   │   ├── components/        # FilterBar, ScreenerResultsTable
│   │   │   │   └── hooks/             # useScreener()
│   │   │   │
│   │   │   ├── watchlists/            # Watchlist management & Quick Alerts
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   │
│   │   │   └── portfolios/            # Portfolio Tracker & Allocation Analysis
│   │   │       ├── components/        # HoldingsTable, AssetAllocationChart, PnLCard
│   │   │       └── hooks/
│   │   │
│   │   ├── pages/                     # Routed Page Containers
│   │   │   ├── MarketOverviewPage.tsx
│   │   │   ├── StockDetailPage.tsx
│   │   │   ├── ComparePage.tsx
│   │   │   ├── ScreenerPage.tsx
│   │   │   ├── WatchlistPage.tsx
│   │   │   ├── PortfolioPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── router/                    # Route Definitions & Guards
│   │   │   └── AppRouter.tsx
│   │   │
│   │   ├── hooks/                     # Generic / App-wide Custom Hooks
│   │   │   ├── useAuth.ts             # Auth context & token manager
│   │   │   ├── useDebounce.ts         # Search input debouncing
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   └── utils/                     # Formatters & helper utilities
│   │       ├── formatters.ts          # INR currency format, percentage format
│   │       ├── date.ts                # Trading session date math & formatting
│   │       └── math.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── README.md                          # Repository overview and quickstart
└── .gitignore                         # Project-wide ignore rules
```

---

## 3. Key Improvements Over the Current Structure

| Area | Current State | Proposed State | Benefits |
| --- | --- | --- | --- |
| **Backend Organization** | Single `baseapp` containing all views (12KB+), utils (7KB+), and models | Modular Django apps in `backend/apps/` (`stocks`, `market_data`, `forecasts`, etc.) | High modularity, independent unit testing, clear domain boundaries. |
| **ML & Data Pipeline** | Mixed inside `baseapp/utils.py` | Dedicated `backend/ml/` and `backend/tasks/` packages | Prevents look-ahead bias, clean walk-forward validation isolation, reproducible feature pipeline. |
| **Background Processing** | Synchronous/blocking code in request handlers | Isolated Celery tasks in `backend/tasks/` | Market-hour rate-limiting, non-blocking page loads, resilient retry policies. |
| **Frontend Architecture** | Flat `pages/` and `components/` folders | Feature-based modules in `frontend/src/features/` | Easy to scale, collocated hooks & services, minimal component coupling. |
| **Settings & Dependencies** | Single `settings.py` and single `requirements.txt` | Environment-specific `settings/` (`base`, `local`, `production`) and split `requirements/` | Seamless local dev vs. Render/production deployments with zero config collision. |
| **Legacy Templates** | Root `templates/` and `static/` mixing with modern React app | Moved cleanly to `legacy/` during incremental migration | Zero confusion between active React code and deprecated Django template pages. |

---

## 4. Suggested Migration Steps

To adopt this structure without breaking ongoing development, follow this step-by-step migration plan:

1. **Step 1: Move Backend to `backend/` Folder**
   - Place Django project files, apps, and configuration into a root `backend/` directory.
   - Separate settings into `base.py`, `local.py`, and `production.py`.
2. **Step 2: Modularize `baseapp` into Domain Apps**
   - Create `apps/stocks`, `apps/market_data`, `apps/forecasts`, etc.
   - Extract models and views into their respective apps.
3. **Step 3: Extract the ML Pipeline to `backend/ml/`**
   - Move forecasting and backtesting logic out of `utils.py` into `features/`, `models/`, and `validation/`.
4. **Step 4: Organize Frontend into Features**
   - Group existing components and hooks in `frontend/src/` into feature folders (`features/stocks/`, `features/market/`, etc.).
5. **Step 5: Move Legacy HTML/Static Files**
   - Move remaining Django templates to `legacy/templates/` as individual React pages replace them.

---
[Return to Documentation Index](README.md)
