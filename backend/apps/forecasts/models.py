from django.db import models
from apps.stocks.models import Stock

class ForecastRun(models.Model):
    run_date = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=50)
    feature_version = models.CharField(max_length=50)
    baseline_mae = models.FloatField()
    model_mae = models.FloatField()
    direction_accuracy = models.FloatField()

    class Meta:
        db_table = 'forecast_runs'
        ordering = ['-run_date']

    def __str__(self):
        return f"Run {self.id} ({self.model_version}) - Acc: {self.direction_accuracy}%"

class Forecast(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='forecasts')
    forecast_run = models.ForeignKey(ForecastRun, on_delete=models.CASCADE, related_name='forecasts')
    date_generated = models.DateField(db_index=True)
    horizon_days = models.IntegerField(choices=[(1, '1 Day'), (5, '5 Days'), (20, '20 Days')])
    probability_positive = models.FloatField()
    expected_return_pct = models.FloatField()
    lower_bound_price = models.DecimalField(max_digits=12, decimal_places=2)
    upper_bound_price = models.DecimalField(max_digits=12, decimal_places=2)
    confidence_label = models.CharField(max_length=20, choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')])

    class Meta:
        db_table = 'forecasts'
        unique_together = ('stock', 'date_generated', 'horizon_days')
        ordering = ['-date_generated', 'horizon_days']

    def __str__(self):
        return f"{self.stock.symbol} ({self.horizon_days}d): {self.probability_positive}%"
