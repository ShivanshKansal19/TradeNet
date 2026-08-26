from django.db import models
from apps.stocks.models import Stock

class ForecastRun(models.Model):
    run_date = models.DateField(db_index=True)
    model_name = models.CharField(max_length=100, default="EnsembleQuantileRegressor")
    model_version = models.CharField(max_length=50, default="v1.0.0")
    horizon_days = models.IntegerField(default=5)
    sample_size = models.IntegerField(default=0)
    baseline_mae = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    model_mae = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    directional_accuracy = models.DecimalField(max_digits=6, decimal_places=4, blank=True, null=True)
    features_used = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-run_date", "-created_at"]

    def __str__(self):
        return f"{self.model_name} ({self.model_version}) - {self.horizon_days}d on {self.run_date}"

class Forecast(models.Model):
    CONFIDENCE_CHOICES = (
        ("HIGH", "High Confidence"),
        ("MEDIUM", "Medium Confidence"),
        ("LOW", "Low Confidence"),
    )

    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="forecasts")
    run = models.ForeignKey(ForecastRun, on_delete=models.SET_NULL, null=True, blank=True, related_name="predictions")
    horizon_days = models.IntegerField(default=5)  # 1, 5, 20
    current_price = models.DecimalField(max_digits=12, decimal_places=2)
    target_price_mean = models.DecimalField(max_digits=12, decimal_places=2)
    target_price_lower = models.DecimalField(max_digits=12, decimal_places=2)
    target_price_upper = models.DecimalField(max_digits=12, decimal_places=2)
    expected_return_percent = models.DecimalField(max_digits=8, decimal_places=4)
    prob_positive = models.DecimalField(max_digits=6, decimal_places=4)  # 0.0000 to 1.0000
    confidence_label = models.CharField(max_length=20, choices=CONFIDENCE_CHOICES, default="MEDIUM")
    baseline_mae = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    model_mae = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    directional_accuracy = models.DecimalField(max_digits=6, decimal_places=4, blank=True, null=True)
    model_version = models.CharField(max_length=50, default="v1.0.0")
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-generated_at", "horizon_days"]
        indexes = [
            models.Index(fields=["stock", "horizon_days"]),
        ]

    def __str__(self):
        return f"{self.stock.symbol} {self.horizon_days}d Forecast: {self.target_price_mean} ({self.confidence_label})"
