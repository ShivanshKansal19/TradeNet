from django.db import models
from django.contrib.auth.models import User
from apps.stocks.models import Stock

class Portfolio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'portfolios'
        unique_together = ('user', 'name')

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class PortfolioHolding(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='holdings')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=4)
    average_buy_price = models.DecimalField(max_digits=12, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'portfolio_holdings'
        unique_together = ('portfolio', 'stock')

    def __str__(self):
        return f"{self.portfolio.name} - {self.stock.symbol} ({self.quantity})"
