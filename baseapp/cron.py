from django_cron import CronJobBase, Schedule
from .models import TrendingStock
# Assume you save the above function in utils.py
from .utils import get_trending_stocks


class UpdateTrendingStocks(CronJobBase):
    RUN_EVERY_MINS = 1  # Adjust as needed

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'stocks.update_trending_stocks'  # Unique code for the job

    def do(self):
        trending_stocks = get_trending_stocks()
        TrendingStock.objects.all().delete()  # Clear old data
        for stock in trending_stocks:
            TrendingStock.objects.create(
                ticker=stock['ticker'],
                name=stock['name'],
                price=stock['price'],
                change=stock['change'],
                volume=stock['volume'],
                timestamp=stock['timestamp']
            )
        print("trending stocks updated.")
