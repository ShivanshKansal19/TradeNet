from django.db import models
from django.contrib.auth.models import User
from apps.stocks.models import Stock

class Alert(models.Model):
    ALERT_TYPE_CHOICES = (
        ("PRICE_ABOVE", "Price Rises Above"),
        ("PRICE_BELOW", "Price Falls Below"),
        ("RSI_ABOVE", "RSI Rises Above (Overbought)"),
        ("RSI_BELOW", "RSI Falls Below (Oversold)"),
        ("VOLUME_SPIKE", "Volume Spikes Above"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alerts")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="alerts")
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPE_CHOICES)
    threshold_value = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)
    triggered_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.stock.symbol} {self.alert_type} {self.threshold_value}"

class AlertNotification(models.Model):
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification for {self.alert}: {self.message[:40]}"
