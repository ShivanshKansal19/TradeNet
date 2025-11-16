from django.contrib import admin
from .models import Stock, Sector

# Register your models here.
admin.site.site_header = "TradeNet Admin"
admin.site.site_title = "TradeNet Admin Portal"
admin.site.index_title = "Welcome to TradeNet Admin Portal"

admin.site.register(Stock)
admin.site.register(Sector)
