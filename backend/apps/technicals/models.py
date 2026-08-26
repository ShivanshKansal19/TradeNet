from django.db import models
from apps.stocks.models import Stock

class TechnicalIndicator(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="technical_indicators")
    date = models.DateField(db_index=True)
    rsi_14 = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    macd = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    macd_signal = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    macd_hist = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    sma_20 = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    sma_50 = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    sma_200 = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    ema_20 = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    atr_14 = models.DecimalField(max_digits=10, decimal_places=4, blank=True, null=True)
    upper_band = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    lower_band = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    signal_summary = models.CharField(max_length=20, default="NEUTRAL")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(fields=["stock", "date"], name="unique_stock_indicator_date")
        ]
        indexes = [
            models.Index(fields=["stock", "date"]),
        ]

    def __str__(self):
        return f"{self.stock.symbol} Indicators on {self.date}: RSI={self.rsi_14}, Signal={self.signal_summary}"
