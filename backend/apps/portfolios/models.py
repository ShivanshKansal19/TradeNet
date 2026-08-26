from django.db import models
from django.contrib.auth.models import User
from apps.stocks.models import Stock

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="portfolios")
    name = models.CharField(max_length=100, default="My Portfolio")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}'s Portfolio: {self.name}"

class PortfolioHolding(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="holdings")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="portfolio_holdings")
    quantity = models.DecimalField(max_digits=12, decimal_places=4)
    average_buy_price = models.DecimalField(max_digits=12, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["stock__symbol"]
        constraints = [
            models.UniqueConstraint(fields=["portfolio", "stock"], name="unique_portfolio_stock")
        ]

    def __str__(self):
        return f"{self.portfolio.name}: {self.quantity} shares of {self.stock.symbol} @ {self.average_buy_price}"

class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ("BUY", "Buy"),
        ("SELL", "Sell"),
    )

    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="transactions")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=12, decimal_places=4)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-executed_at"]

    def __str__(self):
        return f"{self.transaction_type} {self.quantity} {self.stock.symbol} @ {self.price}"
