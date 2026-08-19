from rest_framework import serializers
from .models import Watchlist, WatchlistItem
from apps.stocks.serializers import StockSerializer

class WatchlistItemSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)

    class Meta:
        model = WatchlistItem
        fields = ['id', 'stock', 'added_at']

class WatchlistSerializer(serializers.ModelSerializer):
    items = WatchlistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Watchlist
        fields = ['id', 'name', 'items', 'created_at']
