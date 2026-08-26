from django.core.management.base import BaseCommand
from tasks.forecast_generation import generate_all_forecasts

class Command(BaseCommand):
    help = "Run ML feature generation, walk-forward testing, and forecast batch runs."

    def handle(self, *args, **options):
        self.stdout.write("Running forecast pipeline...")
        res = generate_all_forecasts()
        self.stdout.write(self.style.SUCCESS(str(res)))
