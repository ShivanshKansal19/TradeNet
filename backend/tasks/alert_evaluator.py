import logging
from decimal import Decimal
from celery import shared_task
from django.utils import timezone
from apps.alerts.models import Alert, AlertNotification

logger = logging.getLogger(__name__)

@shared_task(name="tasks.alert_evaluator.evaluate_all_alerts")
def evaluate_all_alerts():
    """Evaluates all active alerts and creates notifications when triggered."""
    alerts = Alert.objects.filter(is_active=True).select_related("stock", "user")
    triggered_count = 0

    for alert in alerts:
        stock = alert.stock
        curr_price = stock.current_price
        threshold = alert.threshold_value
        is_triggered = False
        msg = ""

        if alert.alert_type == "PRICE_ABOVE" and curr_price and curr_price >= threshold:
            is_triggered = True
            msg = f"{stock.symbol} crossed above ₹{threshold} (Current: ₹{curr_price})."
        elif alert.alert_type == "PRICE_BELOW" and curr_price and curr_price <= threshold:
            is_triggered = True
            msg = f"{stock.symbol} dropped below ₹{threshold} (Current: ₹{curr_price})."
        elif alert.alert_type in ("RSI_ABOVE", "RSI_BELOW"):
            latest_ind = stock.technical_indicators.first()
            if latest_ind and latest_ind.rsi_14 is not None:
                if alert.alert_type == "RSI_ABOVE" and latest_ind.rsi_14 >= threshold:
                    is_triggered = True
                    msg = f"{stock.symbol} RSI reached {latest_ind.rsi_14} (Threshold: {threshold})."
                elif alert.alert_type == "RSI_BELOW" and latest_ind.rsi_14 <= threshold:
                    is_triggered = True
                    msg = f"{stock.symbol} RSI dropped to {latest_ind.rsi_14} (Threshold: {threshold})."

        if is_triggered:
            AlertNotification.objects.create(alert=alert, message=msg)
            alert.triggered_at = timezone.now()
            alert.is_active = False  # Trigger once unless recurring
            alert.save(update_fields=["triggered_at", "is_active", "updated_at"])
            triggered_count += 1

    return f"Evaluated alerts, triggered {triggered_count}."
