"""Celery configuration for TradeNet."""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

app = Celery("tradenet")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Celery Beat Periodic Tasks
app.conf.beat_schedule = {
    # Refresh live quotes during market hours (9:15 AM - 3:30 PM IST, Monday - Friday)
    "refresh-market-quotes-intraday": {
        "task": "tasks.data_ingestion.sync_intraday_quotes",
        "schedule": crontab(minute="*/15", hour="9-15", day_of_week="1-5"),
    },
    # Ingest final EOD data after market close (4:00 PM IST, Monday - Friday)
    "ingest-eod-market-data": {
        "task": "tasks.data_ingestion.sync_eod_data",
        "schedule": crontab(minute=0, hour=16, day_of_week="1-5"),
    },
    # Compute technical indicators (4:30 PM IST)
    "compute-technical-indicators": {
        "task": "tasks.indicator_calculation.compute_all_indicators",
        "schedule": crontab(minute=30, hour=16, day_of_week="1-5"),
    },
    # Generate ML forecasts (5:00 PM IST)
    "generate-ml-forecasts": {
        "task": "tasks.forecast_generation.generate_all_forecasts",
        "schedule": crontab(minute=0, hour=17, day_of_week="1-5"),
    },
    # Evaluate alerts (Every 5 minutes)
    "evaluate-alerts": {
        "task": "tasks.alert_evaluator.evaluate_all_alerts",
        "schedule": crontab(minute="*/5"),
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
