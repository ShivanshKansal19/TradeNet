from django.db import models

class Stock(models.Model):
    symbol = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    exchange = models.CharField(max_length=20, default="NSE")
    sector = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    market_cap = models.FloatField(blank=True, null=True)
    current_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    day_change = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    day_change_percent = models.DecimalField(max_digits=8, decimal_places=4, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["symbol"]
        indexes = [
            models.Index(fields=["symbol"]),
            models.Index(fields=["sector"]),
        ]

    def __str__(self):
        return f"{self.symbol} ({self.name})"

class StockPrice(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="prices")
    date = models.DateField(db_index=True)
    open_price = models.DecimalField(max_digits=12, decimal_places=2)
    high_price = models.DecimalField(max_digits=12, decimal_places=2)
    low_price = models.DecimalField(max_digits=12, decimal_places=2)
    close_price = models.DecimalField(max_digits=12, decimal_places=2)
    volume = models.BigIntegerField()
    adjusted_close = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(fields=["stock", "date"], name="unique_stock_price_date")
        ]
        indexes = [
            models.Index(fields=["stock", "date"]),
        ]

    def __str__(self):
        return f"{self.stock.symbol} - {self.date}: {self.close_price}"

class StockFundamental(models.Model):
    stock = models.OneToOneField(Stock, on_delete=models.CASCADE, related_name="fundamentals")
    pe_ratio = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    pb_ratio = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    eps = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    roe = models.DecimalField(max_digits=8, decimal_places=4, blank=True, null=True)
    debt_to_equity = models.DecimalField(max_digits=8, decimal_places=4, blank=True, null=True)
    dividend_yield = models.DecimalField(max_digits=8, decimal_places=4, blank=True, null=True)
    book_value = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    week_52_high = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    week_52_low = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.stock.symbol} Fundamentals"
