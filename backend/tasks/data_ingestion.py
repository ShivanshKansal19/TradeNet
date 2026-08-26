import logging
from decimal import Decimal
from celery import shared_task
from django.utils import timezone
from apps.stocks.models import Stock, StockPrice, StockFundamental
from apps.market_data.models import MarketIndex, SectorPerformance
from apps.market_data.providers.yahoo_finance import YFinanceProvider

logger = logging.getLogger(__name__)

@shared_task(name="tasks.data_ingestion.sync_intraday_quotes")
def sync_intraday_quotes():
    """Refreshes live quotes for all active stocks and market indices."""
    provider = YFinanceProvider()
    stocks = Stock.objects.filter(is_active=True)
    count = 0

    for stock in stocks:
        try:
            quote = provider.fetch_quote(stock.symbol)
            if quote.get("current_price"):
                stock.current_price = Decimal(str(round(quote["current_price"], 2)))
                stock.day_change = Decimal(str(round(quote.get("day_change", 0), 2)))
                stock.day_change_percent = Decimal(str(round(quote.get("day_change_percent", 0), 4)))
                stock.save(update_fields=["current_price", "day_change", "day_change_percent", "updated_at"])
                count += 1
        except Exception as e:
            logger.error(f"Failed quote sync for {stock.symbol}: {e}")

    # Sync market indices
    for item in provider.fetch_market_indices():
        try:
            MarketIndex.objects.update_or_create(
                symbol=item["symbol"],
                defaults={
                    "name": item["name"],
                    "value": Decimal(str(round(item["value"], 2))),
                    "change": Decimal(str(round(item["change"], 2))),
                    "change_percent": Decimal(str(round(item["change_percent"], 4))),
                }
            )
        except Exception as e:
            logger.error(f"Failed index sync for {item['symbol']}: {e}")

    return f"Synced intraday quotes for {count} stocks."

@shared_task(name="tasks.data_ingestion.sync_eod_data")
def sync_eod_data():
    """Ingests end-of-day OHLCV prices into StockPrice model (strictly idempotent)."""
    provider = YFinanceProvider()
    stocks = Stock.objects.filter(is_active=True)
    total_records = 0

    for stock in stocks:
        try:
            df = provider.fetch_historical_ohlcv(stock.symbol, period="1mo", interval="1d")
            if df.empty:
                continue

            for date_idx, row in df.iterrows():
                d = date_idx.date() if hasattr(date_idx, "date") else date_idx
                StockPrice.objects.update_or_create(
                    stock=stock,
                    date=d,
                    defaults={
                        "open_price": Decimal(str(round(row["open"], 2))),
                        "high_price": Decimal(str(round(row["high"], 2))),
                        "low_price": Decimal(str(round(row["low"], 2))),
                        "close_price": Decimal(str(round(row["close"], 2))),
                        "volume": int(row["volume"]),
                        "adjusted_close": Decimal(str(round(row.get("adjusted_close", row["close"]), 2))),
                    }
                )
                total_records += 1
        except Exception as e:
            logger.error(f"Failed EOD sync for {stock.symbol}: {e}")

    return f"Synced {total_records} EOD price records."
