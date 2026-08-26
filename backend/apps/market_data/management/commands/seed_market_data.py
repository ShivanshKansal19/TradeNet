from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.stocks.models import Stock
from apps.market_data.models import MarketIndex, SectorPerformance
from apps.market_data.providers.yahoo_finance import YFinanceProvider
from apps.market_data.providers.seeder import SECTORS_SEED
from apps.stocks.services.stock_service import StockService, POPULAR_NSE_STOCKS

NIFTY_50_SYMBOLS = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "BHARTIARTL", "ITC", "SBIN", "LT",
    "BAJFINANCE", "HINDUNILVR", "MARUTI", "SUNPHARMA", "TATAMOTORS", "M&M", "NTPC", "AXISBANK",
    "KOTAKBANK", "ONGC", "TITAN", "ADANIENT", "ADANIPORTS", "POWERGRID", "TATASTEEL", "COALINDIA",
    "ULTRACEMCO", "JSWSTEEL", "BAJAJFINSV", "GRASIM", "TECHM", "HCLTECH", "NESTLEIND", "WIPRO",
    "EICHERMOT", "DRREDDY", "CIPLA", "DIVISLAB", "APOLLOHOSP", "HEROMOTOCO", "BRITANNIA",
    "TATACONSUM", "SHRIRAMFIN", "BPCL", "SBILIFE", "HDFCLIFE", "LTIM", "HINDALCO", "BEL", "TRENT",
    "ZOMATO", "TATAPOWER", "IRFC", "JIOFIN", "HAL", "SUZLON"
]

class Command(BaseCommand):
    help = "Sync database with live Market Indices, Sectors, and Full NIFTY 50 universe using Yahoo Finance."

    def add_arguments(self, parser):
        parser.add_argument("--symbols", nargs="+", help="Specific symbols to sync (e.g. --symbols RELIANCE TCS MARUTI)")
        parser.add_argument("--limit", type=int, default=50, help="Max number of NIFTY 50 stocks to sync (default: 50)")

    def handle(self, *args, **options):
        provider = YFinanceProvider()

        # 1. Sync Live Market Indices
        self.stdout.write(self.style.NOTICE("Fetching live Market Indices from Yahoo Finance..."))
        live_indices = provider.fetch_market_indices()
        for item in live_indices:
            MarketIndex.objects.update_or_create(
                symbol=item["symbol"],
                defaults={
                    "name": item["name"],
                    "value": Decimal(str(round(item["value"], 2))),
                    "change": Decimal(str(round(item["change"], 2))),
                    "change_percent": Decimal(str(round(item["change_percent"], 4))),
                },
            )
            self.stdout.write(f"  Synced index: {item['name']} ({item['symbol']}) -> ₹{item['value']}")

        # 2. Sync Sector Performance
        self.stdout.write(self.style.NOTICE("Seeding sector performance structure..."))
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

        # 3. Determine symbols to fetch
        symbols_to_sync = options.get("symbols") or NIFTY_50_SYMBOLS[:options.get("limit", 50)]
        self.stdout.write(self.style.NOTICE(f"Fetching live data for {len(symbols_to_sync)} Indian stocks via Yahoo Finance..."))

        success_count = 0
        for idx, sym in enumerate(symbols_to_sync, start=1):
            self.stdout.write(f"[{idx}/{len(symbols_to_sync)}] Fetching live data for {sym}...")
            stock = StockService.fetch_and_sync_stock_live(sym)
            if stock:
                success_count += 1
                self.stdout.write(self.style.SUCCESS(f"  ✓ {stock.symbol} ({stock.name}) - ₹{stock.current_price} ({stock.day_change_percent}%)"))
            else:
                self.stdout.write(self.style.WARNING(f"  ✗ Could not fetch data for {sym}"))

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully synced {success_count}/{len(symbols_to_sync)} live stocks with prices, technicals, and ML forecasts!"))

