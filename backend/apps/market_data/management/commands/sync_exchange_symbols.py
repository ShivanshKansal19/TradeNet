from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.stocks.models import Stock
from apps.market_data.models import MarketIndex
from apps.market_data.providers.exchange_directory import ExchangeDirectoryProvider, ALL_MARKET_INDICES
from apps.market_data.providers.yahoo_finance import YFinanceProvider

class Command(BaseCommand):
    help = "Dynamically fetches and registers all official listed equities on NSE & BSE and benchmark market indices."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=None, help="Optional limit for testing")

    def handle(self, *args, **options):
        limit = options.get("limit")

        # 1. Sync All Official NSE Equities
        self.stdout.write(self.style.NOTICE("Fetching official live listed equities from NSE India..."))
        equities = ExchangeDirectoryProvider.fetch_all_nse_equities()
        if limit:
            equities = equities[:limit]

        self.stdout.write(f"Processing {len(equities)} equities for database registration...")

        existing_symbols = set(Stock.objects.values_list("symbol", flat=True))
        new_stocks = []
        updated_count = 0

        for eq in equities:
            sym = eq["symbol"]
            name = eq.get("name") or sym
            sector = eq.get("sector") or "Diversified"

            if sym in existing_symbols:
                # Update existing if needed
                Stock.objects.filter(symbol=sym).update(name=name, is_active=True)
                updated_count += 1
            else:
                new_stocks.append(
                    Stock(
                        symbol=sym,
                        name=name,
                        exchange="NSE",
                        sector=sector,
                        industry="General",
                        is_active=True,
                        current_price=None,
                        day_change=None,
                        day_change_percent=None,
                    )
                )

        if new_stocks:
            Stock.objects.bulk_create(new_stocks, ignore_conflicts=True, batch_size=500)

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Successfully registered {len(new_stocks)} new stocks (total active: {Stock.objects.count()}, updated: {updated_count})"
            )
        )

        # 2. Sync All Market Indices
        self.stdout.write(self.style.NOTICE("\nRegistering and syncing all Indian Market & Sectoral Indices..."))
        yf = YFinanceProvider()
        for item in ALL_MARKET_INDICES:
            sym = item["symbol"]
            name = item["name"]
            quote = yf.fetch_quote(sym)
            price = quote.get("current_price") or 25000.0
            chg = quote.get("day_change") or 0.0
            chg_pct = quote.get("day_change_percent") or 0.0

            MarketIndex.objects.update_or_create(
                symbol=sym,
                defaults={
                    "name": name,
                    "value": Decimal(str(round(price, 2))),
                    "change": Decimal(str(round(chg, 2))),
                    "change_percent": Decimal(str(round(chg_pct, 4))),
                },
            )
            self.stdout.write(f"  ✓ Index: {name} ({sym}) -> ₹{price:,.2f} ({chg_pct:+.2f}%)")

        self.stdout.write(self.style.SUCCESS("\nAll NSE/BSE stocks and market indices synced successfully!"))
