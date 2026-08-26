from django.db import models

class MarketIndex(models.Model):
    symbol = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=12, decimal_places=2)
    change = models.DecimalField(max_digits=12, decimal_places=2)
    change_percent = models.DecimalField(max_digits=8, decimal_places=4)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Market Indices"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}: {self.value} ({self.change_percent}%)"

class SectorPerformance(models.Model):
    sector_name = models.CharField(max_length=100, unique=True)
    change_percent = models.DecimalField(max_digits=8, decimal_places=4)
    top_gainer = models.CharField(max_length=50, blank=True, null=True)
    top_loser = models.CharField(max_length=50, blank=True, null=True)
    market_cap = models.FloatField(blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-change_percent"]

    def __str__(self):
        return f"{self.sector_name}: {self.change_percent}%"
