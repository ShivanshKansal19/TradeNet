from django.core.management.base import BaseCommand
from tasks.data_ingestion import sync_intraday_quotes, sync_eod_data
from tasks.indicator_calculation import compute_all_indicators

class Command(BaseCommand):
    help = "Sync market data and refresh indicators (synchronous runner for local dev)."

    def add_arguments(self, parser):
        parser.add_argument("--eod", action="store_true", help="Sync full EOD price history")

    def handle(self, *args, **options):
        self.stdout.write("Syncing live quotes...")
        q_res = sync_intraday_quotes()
        self.stdout.write(self.style.SUCCESS(str(q_res)))

        if options["eod"]:
            self.stdout.write("Syncing EOD history...")
            e_res = sync_eod_data()
            self.stdout.write(self.style.SUCCESS(str(e_res)))

        self.stdout.write("Recomputing indicators...")
        i_res = compute_all_indicators()
        self.stdout.write(self.style.SUCCESS(str(i_res)))
