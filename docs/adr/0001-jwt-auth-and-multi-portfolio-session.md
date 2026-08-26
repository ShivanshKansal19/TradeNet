# JWT Authentication and Multi-Portfolio Session Architecture

## Context & Decision

We needed a scalable, developer-friendly authentication and portfolio management architecture for TradeNet that supports guest market exploration while securing user-owned portfolios and watchlists.

We decided to implement:
1. **Hybrid Public/Protected Access**: Public market discovery pages (Dashboard, Screener, Stock Detail, Compare) remain open for guest users, while personalized pages (`/portfolio`, `/profile`, `/watchlist`) and action triggers require authentication.
2. **JWT Storage & Interceptors**: Access and Refresh JWT tokens are persisted in `localStorage`. Axios request interceptors attach Bearer tokens, and response interceptors intercept `401 Unauthorized` responses to seamlessly refresh tokens or evict expired sessions with a login redirect toast.
3. **Auto-Provisioned Default Portfolio**: When a new user registers, the backend automatically provisions a default "My Portfolio" to eliminate onboarding friction.
4. **URL-Driven Multi-Portfolio Navigation**: Users can own multiple named portfolios, with `/portfolio` redirecting to their primary portfolio and `/portfolio/:id` enabling deep-linking and bookmarking.

## Status

Accepted

## Considered Options

- **Strict Global Auth Gate**: Rejected to maximize guest engagement and SEO on market data and screeners.
- **HttpOnly Cookie Sessions**: Rejected in favor of RESTful JWT with Bearer tokens for standard API client interoperability across web and future mobile clients.
