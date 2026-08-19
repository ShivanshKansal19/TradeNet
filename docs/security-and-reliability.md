# Security and Reliability

## Security Practices

- Use environment variables for provider credentials and Django secrets.
- Validate symbols and user inputs on all endpoints.
- Authorize every portfolio and watchlist action against the authenticated user.

## Reliability & Failover

- Rate-limit public API endpoints and cache popular stock requests in Redis.
- Log provider failures and clearly display to users when data was last refreshed.
- Enforce database constraints for unique `(symbol, date)` price records.
- Routinely back up PostgreSQL database and set up monitoring/alerts for failed worker jobs.

## Disclaimer & Compliance

Add a clear educational disclaimer: **forecasts are not investment advice**. Every forecast display must show its time horizon, confidence range, model version, and baseline comparison.

---
[Return to Documentation Index](README.md)
