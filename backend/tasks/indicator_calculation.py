import logging
import pandas as pd
from decimal import Decimal
from celery import shared_task
from apps.stocks.models import Stock, StockPrice
from apps.technicals.models import TechnicalIndicator
from apps.technicals.indicators import compute_technical_indicators_df

logger = logging.getLogger(__name__)

@shared_task(name="tasks.indicator_calculation.compute_all_indicators")
def compute_all_indicators():
    """Batch computes indicators for all active stocks based on historical prices."""
    stocks = Stock.objects.filter(is_active=True)
    count = 0

    for stock in stocks:
        prices = stock.prices.all().order_by("date")
        if prices.count() < 10:
            continue

        records = [
            {
                "date": p.date,
                "open": float(p.open_price),
                "high": float(p.high_price),
                "low": float(p.low_price),
                "close": float(p.close_price),
                "volume": float(p.volume),
            }
            for p in prices
        ]
        df = pd.DataFrame(records)
        df_indicators = compute_technical_indicators_df(df)

        # Store latest indicator records
        for _, row in df_indicators.iterrows():
            d = row["date"]
            TechnicalIndicator.objects.update_or_create(
                stock=stock,
                date=d,
                defaults={
                    "rsi_14": Decimal(str(round(row["rsi_14"], 2))) if pd.notna(row.get("rsi_14")) else None,
                    "macd": Decimal(str(round(row["macd"], 4))) if pd.notna(row.get("macd")) else None,
                    "macd_signal": Decimal(str(round(row["macd_signal"], 4))) if pd.notna(row.get("macd_signal")) else None,
                    "macd_hist": Decimal(str(round(row["macd_hist"], 4))) if pd.notna(row.get("macd_hist")) else None,
                    "sma_20": Decimal(str(round(row["sma_20"], 2))) if pd.notna(row.get("sma_20")) else None,
                    "sma_50": Decimal(str(round(row["sma_50"], 2))) if pd.notna(row.get("sma_50")) else None,
                    "sma_200": Decimal(str(round(row["sma_200"], 2))) if pd.notna(row.get("sma_200")) else None,
                    "ema_20": Decimal(str(round(row["ema_20"], 2))) if pd.notna(row.get("ema_20")) else None,
                    "atr_14": Decimal(str(round(row["atr_14"], 4))) if pd.notna(row.get("atr_14")) else None,
                    "upper_band": Decimal(str(round(row["upper_band"], 2))) if pd.notna(row.get("upper_band")) else None,
                    "lower_band": Decimal(str(round(row["lower_band"], 2))) if pd.notna(row.get("lower_band")) else None,
                    "signal_summary": row.get("signal_summary", "NEUTRAL"),
                }
            )
        count += 1

    return f"Computed indicators for {count} stocks."
