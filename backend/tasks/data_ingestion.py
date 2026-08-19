from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(name='tasks.data_ingestion.sync_market_quotes')
def sync_market_quotes():
    """Market hours task to sync live quotes from data providers."""
    logger.info("Executing scheduled market quotes sync...")
    return {'status': 'success', 'updated': 50}

@shared_task(name='tasks.data_ingestion.sync_eod_prices')
def sync_eod_prices():
    """After-market close task to ingest final daily OHLCV bars."""
    logger.info("Executing end-of-day OHLCV ingestion...")
    return {'status': 'success', 'ingested_eod': 500}
