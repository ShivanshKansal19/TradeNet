from django.db import models
from django.contrib.auth.models import User
from apps.stocks.models import Stock

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlists")
    name = models.CharField(max_length=100, default="My Watchlist")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "name"]

    def __str__(self):
        return f"{self.user.username}'s Watchlist: {self.name}"

class WatchlistItem(models.Model):
    watchlist = models.ForeignKey(Watchlist, on_delete=models.CASCADE, related_name="items")
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="watchlist_entries")
    notes = models.TextField(blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-added_at"]
        constraints = [
            models.UniqueConstraint(fields=["watchlist", "stock"], name="unique_watchlist_stock")
        ]

    def __str__(self):
        return f"{self.watchlist.name} -> {self.stock.symbol}"
