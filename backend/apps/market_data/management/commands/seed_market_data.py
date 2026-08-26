from django.core.management.base import BaseCommand
from decimal import Decimal
import pandas as pd
from apps.stocks.models import Stock, StockPrice, StockFundamental
from apps.market_data.models import MarketIndex, SectorPerformance
from apps.technicals.models import TechnicalIndicator
from apps.technicals.indicators import compute_technical_indicators_df
from apps.forecasts.models import ForecastRun, Forecast
from apps.market_data.providers.seeder import (
    TOP_INDIAN_STOCKS,
    MARKET_INDICES_SEED,
    SECTORS_SEED,
    generate_synthetic_history,
)
from ml.pipeline import MLForecastPipeline

class Command(BaseCommand):
    help = "Seed database with Top Indian stocks, market indices, sectors, historical prices, indicators, and ML forecasts."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding market indices..."))
        for item in MARKET_INDICES_SEED:
            MarketIndex.objects.update_or_create(
                symbol=item["symbol"],
                defaults={
                    "name": item["name"],
                    "value": item["value"],
                    "change": item["change"],
                    "change_percent": item["change_percent"],
                },
            )

        self.stdout.write(self.style.NOTICE("Seeding sector performance..."))
        for item in SECTORS_SEED:
            SectorPerformance.objects.update_or_create(
                sector_name=item["sector_name"],
                defaults={
                    "change_percent": item["change_percent"],
                    "top_gainer": item["top_gainer"],
                    "top_loser": item["top_loser"],
                    "market_cap": item["market_cap"],
                },
            )

        self.stdout.write(self.style.NOTICE("Seeding stocks, history, technicals, and forecasts..."))
        pipeline = MLForecastPipeline(horizons=[1, 5, 20])

        for stock_data in TOP_INDIAN_STOCKS:
            stock, _ = Stock.objects.update_or_create(
                symbol=stock_data["symbol"],
                defaults={
                    "name": stock_data["name"],
                    "exchange": "NSE",
                    "sector": stock_data["sector"],
                    "industry": stock_data["industry"],
                    "market_cap": stock_data["market_cap"],
                    "current_price": stock_data["current_price"],
                    "day_change": stock_data["day_change"],
                    "day_change_percent": stock_data["day_change_percent"],
                    "is_active": True,
                },
            )

            # Fundamentals
            fund_data = stock_data["fundamentals"]
            StockFundamental.objects.update_or_create(
                stock=stock,
                defaults=fund_data,
            )

            # Historical Prices (250 trading days)
            history = generate_synthetic_history(float(stock_data["current_price"]), days=250)
            for bar in history:
                StockPrice.objects.update_or_create(
                    stock=stock,
                    date=bar["date"],
                    defaults={
                        "open_price": bar["open_price"],
                        "high_price": bar["high_price"],
                        "low_price": bar["low_price"],
                        "close_price": bar["close_price"],
                        "volume": bar["volume"],
                        "adjusted_close": bar["adjusted_close"],
                    },
                )

            # Technical Indicators
            price_records = [
                {
                    "date": h["date"],
                    "open": float(h["open_price"]),
                    "high": float(h["high_price"]),
                    "low": float(h["low_price"]),
                    "close": float(h["close_price"]),
                    "volume": float(h["volume"]),
                }
                for h in history
            ]
            ohlcv_df = pd.DataFrame(price_records)
            df_ind = compute_technical_indicators_df(ohlcv_df)

            for _, row in df_ind.tail(60).iterrows():
                TechnicalIndicator.objects.update_or_create(
                    stock=stock,
                    date=row["date"],
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
                    },
                )

            # ML Forecasts
            ml_results = pipeline.run_for_stock(stock.symbol, ohlcv_df)
            if ml_results and "forecasts" in ml_results:
                for f_item in ml_results["forecasts"]:
                    run, _ = ForecastRun.objects.get_or_create(
                        run_date=history[-1]["date"],
                        model_name=f_item["model_name"],
                        model_version=f_item["model_version"],
                        horizon_days=f_item["horizon_days"],
                        defaults={
                            "sample_size": f_item.get("sample_size", 200),
                            "baseline_mae": Decimal(str(f_item.get("baseline_mae", 15.0))),
                            "model_mae": Decimal(str(f_item.get("model_mae", 12.0))),
                            "directional_accuracy": Decimal(str(f_item.get("directional_accuracy", 0.58))),
                            "features_used": f_item.get("features_used", []),
                        },
                    )

                    Forecast.objects.create(
                        stock=stock,
                        run=run,
                        horizon_days=f_item["horizon_days"],
                        current_price=Decimal(str(f_item["current_price"])),
                        target_price_mean=Decimal(str(f_item["target_price_mean"])),
                        target_price_lower=Decimal(str(f_item["target_price_lower"])),
                        target_price_upper=Decimal(str(f_item["target_price_upper"])),
                        expected_return_percent=Decimal(str(f_item["expected_return_percent"])),
                        prob_positive=Decimal(str(f_item["prob_positive"])),
                        confidence_label=f_item["confidence_label"],
                        baseline_mae=Decimal(str(f_item.get("baseline_mae", 15.0))),
                        model_mae=Decimal(str(f_item.get("model_mae", 12.0))),
                        directional_accuracy=Decimal(str(f_item.get("directional_accuracy", 0.58))),
                        model_version=f_item["model_version"],
                    )

            self.stdout.write(self.style.SUCCESS(f"Successfully seeded {stock.symbol}"))

        self.stdout.write(self.style.SUCCESS("All market data, indicators, and ML forecasts seeded successfully!"))
