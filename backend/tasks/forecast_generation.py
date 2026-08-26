import logging
import pandas as pd
from decimal import Decimal
from datetime import datetime
from celery import shared_task
from django.utils import timezone
from apps.stocks.models import Stock
from apps.forecasts.models import ForecastRun, Forecast
from ml.pipeline import MLForecastPipeline

logger = logging.getLogger(__name__)

@shared_task(name="tasks.forecast_generation.generate_all_forecasts")
def generate_all_forecasts():
    """Generates 1d, 5d, 20d ML forecasts for all active stocks."""
    pipeline = MLForecastPipeline(horizons=[1, 5, 20])
    stocks = Stock.objects.filter(is_active=True)
    today = timezone.now().date()
    total_forecasts = 0

    for stock in stocks:
        prices = stock.prices.all().order_by("date")
        if prices.count() < 30:
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
        ohlcv_df = pd.DataFrame(records)

        try:
            result = pipeline.run_for_stock(stock.symbol, ohlcv_df)
            if not result or "forecasts" not in result:
                continue

            for item in result["forecasts"]:
                run, _ = ForecastRun.objects.get_or_create(
                    run_date=today,
                    model_name=item["model_name"],
                    model_version=item["model_version"],
                    horizon_days=item["horizon_days"],
                    defaults={
                        "sample_size": item.get("sample_size", 0),
                        "baseline_mae": Decimal(str(item.get("baseline_mae", 0))),
                        "model_mae": Decimal(str(item.get("model_mae", 0))),
                        "directional_accuracy": Decimal(str(item.get("directional_accuracy", 0.5))),
                        "features_used": item.get("features_used", []),
                    },
                )

                Forecast.objects.create(
                    stock=stock,
                    run=run,
                    horizon_days=item["horizon_days"],
                    current_price=Decimal(str(item["current_price"])),
                    target_price_mean=Decimal(str(item["target_price_mean"])),
                    target_price_lower=Decimal(str(item["target_price_lower"])),
                    target_price_upper=Decimal(str(item["target_price_upper"])),
                    expected_return_percent=Decimal(str(item["expected_return_percent"])),
                    prob_positive=Decimal(str(item["prob_positive"])),
                    confidence_label=item["confidence_label"],
                    baseline_mae=Decimal(str(item.get("baseline_mae", 0))),
                    model_mae=Decimal(str(item.get("model_mae", 0))),
                    directional_accuracy=Decimal(str(item.get("directional_accuracy", 0.5))),
                    model_version=item["model_version"],
                )
                total_forecasts += 1
        except Exception as e:
            logger.error(f"Error generating forecast for {stock.symbol}: {e}")

    return f"Generated {total_forecasts} forecast records."
