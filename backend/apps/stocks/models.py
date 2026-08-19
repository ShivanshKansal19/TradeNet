from django.db import models

class Stock(models.Model):
    symbol = models.CharField(max_length=100, db_index=True)
    name = models.CharField(max_length=100)
    series = models.CharField(max_length=100, blank=True, default='')
    date_of_listing = models.DateField(null=True, blank=True)
    isin_number = models.CharField(max_length=12, primary_key=True)

    class Meta:
        db_table = 'baseapp_stock'
        ordering = ['symbol']

    def __str__(self):
        return f"{self.symbol} - {self.name}"

class StockPrice(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='prices')
    date = models.DateField(db_index=True)
    open_price = models.DecimalField(max_digits=12, decimal_places=2)
    high_price = models.DecimalField(max_digits=12, decimal_places=2)
    low_price = models.DecimalField(max_digits=12, decimal_places=2)
    close_price = models.DecimalField(max_digits=12, decimal_places=2)
    volume = models.BigIntegerField()
    provider = models.CharField(max_length=50, default='yahoo')
    is_adjusted = models.BooleanField(default=True)
    retrieved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_prices'
        unique_together = ('stock', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.stock.symbol} ({self.date}): {self.close_price}"
