from django.db import models

class Sector(models.Model):
    sector_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'baseapp_sector'
        ordering = ['sector_name']

    def __str__(self):
        return self.sector_name

class MarketIndex(models.Model):
    symbol = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    current_value = models.DecimalField(max_digits=12, decimal_places=2)
    change = models.DecimalField(max_digits=10, decimal_places=2)
    percent_change = models.DecimalField(max_digits=6, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'market_indices'
        ordering = ['name']

    def __str__(self):
        return f"{self.name}: {self.current_value} ({self.percent_change}%)"

class SectorPerformance(models.Model):
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE, related_name='performance_records')
    date = models.DateField(db_index=True)
    percent_change = models.DecimalField(max_digits=6, decimal_places=2)
    advances = models.IntegerField(default=0)
    declines = models.IntegerField(default=0)

    class Meta:
        db_table = 'sector_performance'
        unique_together = ('sector', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.sector.sector_name} ({self.date}): {self.percent_change}%"
