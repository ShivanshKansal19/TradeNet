from rest_framework import serializers
from .models import Stock, StockPrice

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['isin_number', 'symbol', 'name', 'series', 'date_of_listing']

class StockPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPrice
        fields = ['date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']
