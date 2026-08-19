from django.db import models
from apps.stocks.models import Stock

class TechnicalIndicator(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='indicators')
    date = models.DateField(db_index=True)
    rsi_14 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    macd = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    macd_signal = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    macd_hist = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    sma_20 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    sma_50 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    sma_200 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    atr_14 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'technical_indicators'
        unique_together = ('stock', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.stock.symbol} ({self.date}) RSI: {self.rsi_14}"
