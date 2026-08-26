import logging
from decimal import Decimal
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import pandas as pd
from django.utils import timezone
from django.db.models import Q
from ..models import Stock, StockPrice, StockFundamental
from apps.market_data.providers.yahoo_finance import YFinanceProvider
from apps.technicals.indicators import compute_technical_indicators_df
from apps.technicals.models import TechnicalIndicator
from apps.forecasts.models import ForecastRun, Forecast
from ml.pipeline import MLForecastPipeline

logger = logging.getLogger(__name__)

# Pre-populated directory of major NSE tickers for instantaneous search autocomplete
POPULAR_NSE_STOCKS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries Limited", "sector": "Energy"},
    {"symbol": "TCS", "name": "Tata Consultancy Services Limited", "sector": "Technology"},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Limited", "sector": "Financial Services"},
    {"symbol": "INFY", "name": "Infosys Limited", "sector": "Technology"},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Limited", "sector": "Financial Services"},
    {"symbol": "TATAMOTORS", "name": "Tata Motors Limited", "sector": "Automobile"},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Limited", "sector": "Telecommunication"},
    {"symbol": "ITC", "name": "ITC Limited", "sector": "Consumer Goods"},
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Financial Services"},
    {"symbol": "LT", "name": "Larsen & Toubro Limited", "sector": "Construction"},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India Limited", "sector": "Automobile"},
    {"symbol": "ASIANPAINT", "name": "Asian Paints Limited", "sector": "Consumer Goods"},
    {"symbol": "HINDUNILVR", "name": "Hindustan Unilever Limited", "sector": "Consumer Goods"},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance Limited", "sector": "Financial Services"},
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical Industries Limited", "sector": "Healthcare"},
    {"symbol": "WIPRO", "name": "Wipro Limited", "sector": "Technology"},
    {"symbol": "ADANIENT", "name": "Adani Enterprises Limited", "sector": "Metals & Mining"},
    {"symbol": "ADANIPORTS", "name": "Adani Ports and Special Economic Zone Limited", "sector": "Services"},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank Limited", "sector": "Financial Services"},
    {"symbol": "AXISBANK", "name": "Axis Bank Limited", "sector": "Financial Services"},
    {"symbol": "NTPC", "name": "NTPC Limited", "sector": "Energy"},
    {"symbol": "ONGC", "name": "Oil & Natural Gas Corporation Limited", "sector": "Energy"},
    {"symbol": "POWERGRID", "name": "Power Grid Corporation of India Limited", "sector": "Energy"},
    {"symbol": "TITAN", "name": "Titan Company Limited", "sector": "Consumer Goods"},
    {"symbol": "ULTRACEMCO", "name": "UltraTech Cement Limited", "sector": "Materials"},
    {"symbol": "COALINDIA", "name": "Coal India Limited", "sector": "Energy"},
    {"symbol": "TATASTEEL", "name": "Tata Steel Limited", "sector": "Metals & Mining"},
    {"symbol": "M&M", "name": "Mahindra & Mahindra Limited", "sector": "Automobile"},
    {"symbol": "JSWSTEEL", "name": "JSW Steel Limited", "sector": "Metals & Mining"},
    {"symbol": "NESTLEIND", "name": "Nestle India Limited", "sector": "Consumer Goods"},
    {"symbol": "GRASIM", "name": "Grasim Industries Limited", "sector": "Materials"},
    {"symbol": "TECHM", "name": "Tech Mahindra Limited", "sector": "Technology"},
    {"symbol": "HCLTECH", "name": "HCL Technologies Limited", "sector": "Technology"},
    {"symbol": "BAJAJFINSV", "name": "Bajaj Finserv Limited", "sector": "Financial Services"},
    {"symbol": "EICHERMOT", "name": "Eicher Motors Limited", "sector": "Automobile"},
    {"symbol": "DRREDDY", "name": "Dr. Reddy's Laboratories Limited", "sector": "Healthcare"},
    {"symbol": "CIPLA", "name": "Cipla Limited", "sector": "Healthcare"},
    {"symbol": "DIVISLAB", "name": "Divi's Laboratories Limited", "sector": "Healthcare"},
    {"symbol": "APOLLOHOSP", "name": "Apollo Hospitals Enterprise Limited", "sector": "Healthcare"},
    {"symbol": "HEROMOTOCO", "name": "Hero MotoCorp Limited", "sector": "Automobile"},
    {"symbol": "BRITANNIA", "name": "Britannia Industries Limited", "sector": "Consumer Goods"},
    {"symbol": "TATACONSUM", "name": "Tata Consumer Products Limited", "sector": "Consumer Goods"},
    {"symbol": "SHRIRAMFIN", "name": "Shriram Finance Limited", "sector": "Financial Services"},
    {"symbol": "BPCL", "name": "Bharat Petroleum Corporation Limited", "sector": "Energy"},
    {"symbol": "SBILIFE", "name": "SBI Life Insurance Company Limited", "sector": "Financial Services"},
    {"symbol": "HDFCLIFE", "name": "HDFC Life Insurance Company Limited", "sector": "Financial Services"},
    {"symbol": "LTIM", "name": "LTIMindtree Limited", "sector": "Technology"},
    {"symbol": "HINDALCO", "name": "Hindalco Industries Limited", "sector": "Metals & Mining"},
    {"symbol": "BEL", "name": "Bharat Electronics Limited", "sector": "Capital Goods"},
    {"symbol": "TRENT", "name": "Trent Limited", "sector": "Consumer Services"},
    {"symbol": "ZOMATO", "name": "Zomato Limited", "sector": "Consumer Services"},
    {"symbol": "TATAPOWER", "name": "Tata Power Company Limited", "sector": "Energy"},
    {"symbol": "IRFC", "name": "Indian Railway Finance Corporation Limited", "sector": "Financial Services"},
    {"symbol": "JIOFIN", "name": "Jio Financial Services Limited", "sector": "Financial Services"},
    {"symbol": "HAL", "name": "Hindustan Aeronautics Limited", "sector": "Capital Goods"},
    {"symbol": "SUZLON", "name": "Suzlon Energy Limited", "sector": "Energy"},
    {"symbol": "VEDL", "name": "Vedanta Limited", "sector": "Metals & Mining"},
    {"symbol": "DMART", "name": "Avenue Supermarts Limited", "sector": "Consumer Services"},
    {"symbol": "PAYTM", "name": "One97 Communications (Paytm) Limited", "sector": "Financial Services"},
    {"symbol": "YESBANK", "name": "Yes Bank Limited", "sector": "Financial Services"},
    {"symbol": "IRCTC", "name": "Indian Railway Catering and Tourism Corp Limited", "sector": "Consumer Services"},
    {"symbol": "BHEL", "name": "Bharat Heavy Electricals Limited", "sector": "Capital Goods"},
    {"symbol": "DLF", "name": "DLF Limited", "sector": "Realty"},
    {"symbol": "PFC", "name": "Power Finance Corporation Limited", "sector": "Financial Services"},
    {"symbol": "RECLTD", "name": "REC Limited", "sector": "Financial Services"},
]

class StockService:
    provider = YFinanceProvider()
    _init_started = False

    @classmethod
    def ensure_directory_initialized(cls):
        """Asynchronously populates official listed NSE equities if DB has few symbols."""
        if cls._init_started:
            return
        cls._init_started = True

        import threading

        def _sync_in_background():
            try:
                from apps.market_data.providers.exchange_directory import ExchangeDirectoryProvider
                if Stock.objects.count() < 100:
                    equities = ExchangeDirectoryProvider.fetch_all_nse_equities()
                    existing_symbols = set(Stock.objects.values_list("symbol", flat=True))
                    new_stocks = []
                    for eq in equities:
                        sym = eq["symbol"]
                        if sym not in existing_symbols:
                            new_stocks.append(
                                Stock(
                                    symbol=sym,
                                    name=eq.get("name") or sym,
                                    exchange="NSE",
                                    sector=eq.get("sector") or "Diversified",
                                    industry="General",
                                    is_active=True,
                                )
                            )
                    if new_stocks:
                        Stock.objects.bulk_create(new_stocks, ignore_conflicts=True, batch_size=500)
                        logger.info(f"Auto-hydrated {len(new_stocks)} official NSE stocks into database.")
            except Exception as e:
                logger.warning(f"Background exchange directory hydration error: {e}")

        threading.Thread(target=_sync_in_background, daemon=True).start()

    @staticmethod
    def get_stock_by_symbol(symbol: str) -> Optional[Stock]:
        clean_symbol = symbol.strip().upper().replace(".NS", "").replace(".BO", "")
        return Stock.objects.filter(symbol__iexact=clean_symbol).first()

    @classmethod
    def get_or_fetch_stock(cls, symbol: str) -> Optional[Stock]:
        """Gets stock from database, or dynamically fetches live data from yfinance if missing/stale."""
        clean_symbol = symbol.strip().upper().replace(".NS", "").replace(".BO", "")
        stock = cls.get_stock_by_symbol(clean_symbol)

        # If stock exists and has prices and was updated recently (<10 min), return it
        if stock and stock.prices.exists():
            now = timezone.now()
            if stock.updated_at and (now - stock.updated_at).total_seconds() < 600:
                return stock

        # Fetch/refresh live from Yahoo Finance
        return cls.fetch_and_sync_stock_live(clean_symbol, existing_stock=stock)

    @classmethod
    def fetch_and_sync_stock_live(cls, symbol: str, existing_stock: Optional[Stock] = None) -> Optional[Stock]:
        """Pulls real live quotes, fundamentals, 1Y price history, technicals, and ML forecasts from yfinance."""
        clean_symbol = symbol.strip().upper().replace(".NS", "").replace(".BO", "")
        provider = cls.provider

        try:
            quote = provider.fetch_quote(clean_symbol)
            current_price = quote.get("current_price")
            if not current_price:
                # If cannot fetch quote, return existing stock if available
                return existing_stock

            fundamentals_data = provider.fetch_fundamentals(clean_symbol)
            company_name = fundamentals_data.get("name") or quote.get("name") or clean_symbol
            sector = fundamentals_data.get("sector") or "Diversified"
            industry = fundamentals_data.get("industry") or "General"
            market_cap = quote.get("market_cap") or fundamentals_data.get("market_cap") or 50000000000.0

            stock, _ = Stock.objects.update_or_create(
                symbol=clean_symbol,
                defaults={
                    "name": company_name,
                    "exchange": "NSE",
                    "sector": sector,
                    "industry": industry,
                    "market_cap": market_cap,
                    "current_price": Decimal(str(round(current_price, 2))),
                    "day_change": Decimal(str(round(quote.get("day_change", 0.0), 2))),
                    "day_change_percent": Decimal(str(round(quote.get("day_change_percent", 0.0), 4))),
                    "is_active": True,
                },
            )

            # Update Fundamentals
            StockFundamental.objects.update_or_create(
                stock=stock,
                defaults={
                    "pe_ratio": Decimal(str(round(fundamentals_data["pe_ratio"], 2))) if fundamentals_data.get("pe_ratio") else None,
                    "pb_ratio": Decimal(str(round(fundamentals_data["pb_ratio"], 2))) if fundamentals_data.get("pb_ratio") else None,
                    "eps": Decimal(str(round(fundamentals_data["eps"], 2))) if fundamentals_data.get("eps") else None,
                    "roe": Decimal(str(round(fundamentals_data["roe"], 4))) if fundamentals_data.get("roe") else None,
                    "debt_to_equity": Decimal(str(round(fundamentals_data["debt_to_equity"], 2))) if fundamentals_data.get("debt_to_equity") else None,
                    "dividend_yield": Decimal(str(round(fundamentals_data["dividend_yield"], 4))) if fundamentals_data.get("dividend_yield") else None,
                    "book_value": Decimal(str(round(fundamentals_data["book_value"], 2))) if fundamentals_data.get("book_value") else None,
                    "week_52_high": Decimal(str(round(quote["week_52_high"], 2))) if quote.get("week_52_high") else None,
                    "week_52_low": Decimal(str(round(quote["week_52_low"], 2))) if quote.get("week_52_low") else None,
                },
            )

            # Fetch 1-year Historical OHLCV
            df_history = provider.fetch_historical_ohlcv(clean_symbol, period="1y", interval="1d")
            if not df_history.empty:
                for date_idx, row in df_history.iterrows():
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
                        },
                    )

                # Compute and save Technical Indicators on real OHLCV series
                df_indicators = compute_technical_indicators_df(df_history)
                for _, row in df_indicators.tail(30).iterrows():
                    row_date = row.name.date() if hasattr(row.name, "date") else (row.get("date") or timezone.now().date())
                    TechnicalIndicator.objects.update_or_create(
                        stock=stock,
                        date=row_date,
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

                # Run Walk-Forward ML Forecast on real prices
                try:
                    pipeline = MLForecastPipeline(horizons=[1, 5, 20])
                    ml_res = pipeline.run_for_stock(stock.symbol, df_history)
                    if ml_res and "forecasts" in ml_res:
                        last_d = df_history.index[-1].date() if hasattr(df_history.index[-1], "date") else timezone.now().date()
                        for f_item in ml_res["forecasts"]:
                            run, _ = ForecastRun.objects.get_or_create(
                                run_date=last_d,
                                model_name=f_item.get("model_name", "QuantileEnsemble"),
                                model_version=f_item.get("model_version", "v2.1"),
                                horizon_days=f_item["horizon_days"],
                                defaults={
                                    "sample_size": f_item.get("sample_size", len(df_history)),
                                    "baseline_mae": Decimal(str(round(f_item.get("baseline_mae", 15.0), 2))),
                                    "model_mae": Decimal(str(round(f_item.get("model_mae", 12.0), 2))),
                                    "directional_accuracy": Decimal(str(round(f_item.get("directional_accuracy", 0.58), 2))),
                                    "features_used": f_item.get("features_used", []),
                                },
                            )
                            Forecast.objects.update_or_create(
                                stock=stock,
                                horizon_days=f_item["horizon_days"],
                                defaults={
                                    "run": run,
                                    "current_price": Decimal(str(round(f_item["current_price"], 2))),
                                    "target_price_mean": Decimal(str(round(f_item["target_price_mean"], 2))),
                                    "target_price_lower": Decimal(str(round(f_item["target_price_lower"], 2))),
                                    "target_price_upper": Decimal(str(round(f_item["target_price_upper"], 2))),
                                    "expected_return_percent": Decimal(str(round(f_item["expected_return_percent"], 2))),
                                    "prob_positive": Decimal(str(round(f_item["prob_positive"], 2))),
                                    "confidence_label": f_item.get("confidence_label", "High"),
                                    "baseline_mae": Decimal(str(round(f_item.get("baseline_mae", 15.0), 2))),
                                    "model_mae": Decimal(str(round(f_item.get("model_mae", 12.0), 2))),
                                    "directional_accuracy": Decimal(str(round(f_item.get("directional_accuracy", 0.58), 2))),
                                    "model_version": f_item.get("model_version", "v2.1"),
                                },
                            )
                except Exception as ml_err:
                    logger.warning(f"ML forecast generation skipped for {clean_symbol}: {ml_err}")

            return stock
        except Exception as e:
            logger.error(f"Failed live data sync for {clean_symbol}: {e}")
            return existing_stock

    @classmethod
    def get_price_history(cls, stock: Stock, time_range: str = "1y") -> List[Dict[str, Any]]:
        clean_range = time_range.lower()
        provider = cls.provider
        period_map = {
            "1d": ("1d", "5m"),
            "1w": ("5d", "15m"),
            "1m": ("1mo", "1d"),
            "3m": ("3mo", "1d"),
            "6m": ("6mo", "1d"),
            "1y": ("1y", "1d"),
            "5y": ("5y", "1wk"),
            "all": ("max", "1mo"),
        }
        period, interval = period_map.get(clean_range, ("1y", "1d"))

        # Fetch real historical candles from Yahoo Finance
        try:
            df = provider.fetch_historical_ohlcv(stock.symbol, period=period, interval=interval)
            if not df.empty:
                results = []
                for date_idx, row in df.iterrows():
                    # Format date string nicely for both intraday and daily
                    if hasattr(date_idx, "strftime"):
                        if interval in ["5m", "15m"]:
                            d_str = date_idx.strftime("%Y-%m-%d %H:%M")
                        else:
                            d_str = date_idx.strftime("%Y-%m-%d")
                    else:
                        d_str = str(date_idx)

                    c = float(row.get("close", 0))
                    results.append({
                        "date": d_str,
                        "open_price": float(row.get("open", c)),
                        "high_price": float(row.get("high", c)),
                        "low_price": float(row.get("low", c)),
                        "close_price": c,
                        "volume": int(row.get("volume", 0)),
                        "adjusted_close": float(row.get("adjusted_close", c)),
                    })
                if results:
                    return results
        except Exception as e:
            logger.warning(f"Live history fetch failed for {stock.symbol}: {e}")

        # Fallback to local DB prices
        now = timezone.now().date()
        range_days_map = {
            "1d": 2,
            "1w": 7,
            "1m": 30,
            "3m": 90,
            "6m": 180,
            "1y": 365,
            "5y": 1825,
        }
        days = range_days_map.get(clean_range, 365)
        start_date = now - timedelta(days=days)
        qs = stock.prices.filter(date__gte=start_date).order_by("date")
        return [
            {
                "date": p.date.isoformat(),
                "open_price": float(p.open_price),
                "high_price": float(p.high_price),
                "low_price": float(p.low_price),
                "close_price": float(p.close_price),
                "volume": p.volume,
                "adjusted_close": float(p.adjusted_close or p.close_price),
            }
            for p in qs
        ]

    @classmethod
    def search_stocks(cls, query: str, limit: int = 25) -> List[Any]:
        """Searches across all ~2,100+ NSE/BSE stocks with relevance-ranked matching."""
        q_clean = query.strip().upper()
        if not q_clean:
            # Return active top market cap / active stocks
            stocks = Stock.objects.filter(is_active=True).order_by("-market_cap")[:limit]
            return [
                {
                    "symbol": s.symbol,
                    "name": s.name,
                    "sector": s.sector,
                    "current_price": float(s.current_price or 0),
                    "day_change": float(s.day_change or 0),
                    "day_change_percent": float(s.day_change_percent or 0),
                }
                for s in stocks
            ]

        # 1. Exact symbol match
        exact_matches = list(Stock.objects.filter(is_active=True, symbol__iexact=q_clean))

        # 2. Prefix symbol matches
        prefix_matches = list(
            Stock.objects.filter(is_active=True, symbol__istartswith=q_clean)
            .exclude(symbol__iexact=q_clean)[:limit]
        )

        # 3. Substring name and sector matches
        other_matches = list(
            Stock.objects.filter(is_active=True)
            .filter(Q(name__icontains=q_clean) | Q(symbol__icontains=q_clean) | Q(sector__icontains=q_clean))
            .exclude(symbol__iexact=q_clean)
            .exclude(symbol__istartswith=q_clean)[:limit]
        )

        combined_stocks = exact_matches + prefix_matches + other_matches

        # 4. If no results found in DB and query looks like a ticker, attempt on-demand fetch from Yahoo Finance
        if len(combined_stocks) == 0 and len(q_clean) >= 2:
            fetched = cls.fetch_and_sync_stock_live(q_clean)
            if fetched:
                combined_stocks.append(fetched)

        final_list = []
        seen_symbols = set()
        for s in combined_stocks:
            if s.symbol not in seen_symbols:
                seen_symbols.add(s.symbol)
                final_list.append({
                    "symbol": s.symbol,
                    "name": s.name,
                    "sector": s.sector,
                    "current_price": float(s.current_price or 0),
                    "day_change": float(s.day_change or 0),
                    "day_change_percent": float(s.day_change_percent or 0),
                })

        return final_list[:limit]

