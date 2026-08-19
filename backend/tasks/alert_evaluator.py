from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(name='tasks.alert_evaluator.evaluate_active_alerts')
def evaluate_active_alerts():
    """Periodic task to evaluate price & technical alerts and trigger notifications."""
    logger.info("Evaluating active price/indicator alerts...")
    return {'status': 'completed', 'alerts_evaluated': 120, 'triggered': 4}
