from django.contrib import admin
from .models import Stock, StockPrice

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'name', 'series', 'date_of_listing')
    search_fields = ('symbol', 'name')

@admin.register(StockPrice)
class StockPriceAdmin(admin.ModelAdmin):
    list_display = ('stock', 'date', 'close_price', 'volume')
    list_filter = ('date',)
    search_fields = ('stock__symbol',)
