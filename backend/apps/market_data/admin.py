from django.contrib import admin
from .models import Sector, MarketIndex, SectorPerformance

@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ('id', 'sector_name')
    search_fields = ('sector_name',)

@admin.register(MarketIndex)
class MarketIndexAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'current_value', 'percent_change', 'updated_at')

@admin.register(SectorPerformance)
class SectorPerformanceAdmin(admin.ModelAdmin):
    list_display = ('sector', 'date', 'percent_change', 'advances', 'declines')
    list_filter = ('date', 'sector')
