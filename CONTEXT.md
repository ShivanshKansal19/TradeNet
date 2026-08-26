# TradeNet

An analytics, screening, and portfolio tracking platform for Indian equities (NSE & BSE).

## Language

### Identity & Access

**User**:
An authenticated account entity managing credentials, sessions, and owning personal trading data.
_Avoid_: Account, client, customer

**User Profile**:
The personal identity and account attributes of a User (username, email, name, join date).
_Avoid_: Member profile, account info

### Portfolios & Holdings

**Portfolio**:
A named container owned by a User that aggregates stock holdings, historical transactions, and performance analytics.
_Avoid_: Wallet, fund, basket

**Portfolio Holding**:
The aggregated position of a specific Stock within a Portfolio, defined by total quantity and weighted average buy price.
_Avoid_: Asset, stock position, inventory

**Transaction**:
An immutable execution record (Buy or Sell) of a Stock within a Portfolio at a specific price and timestamp.
_Avoid_: Trade, fill, order
