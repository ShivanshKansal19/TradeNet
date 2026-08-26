# Deployment Path and Delivery Roadmap

## Deployment Strategy

Start with a Django API, PostgreSQL, Redis, and Celery worker hosted on the same infrastructure provider.

Deploy React separately as a static site or serve its built assets from Django during the initial phase. As system load grows, move background workers and prediction services to independent isolated processes.

## Delivery Roadmap

1. **Phase 1:** Add Django REST Framework endpoints and migrate the stock-detail page to React.
2. **Phase 2:** Make historical data, search, charts, and technical indicators reliable.
3. **Phase 3:** Add short-horizon, walk-forward-validated forecasts with transparent metrics.
4. **Phase 4:** Add watchlists and alerts.
5. **Phase 5:** Add comparison tool and screeners.
6. **Phase 6:** Add portfolio tracking.
7. **Phase 7:** Add news/event data after the core market data pipeline is dependable.

---
[Return to Documentation Index](README.md)
