from rest_framework import serializers
from .models import Watchlist, WatchlistItem
from apps.stocks.serializers import StockSummarySerializer

class WatchlistItemSerializer(serializers.ModelSerializer):
    stock = StockSummarySerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WatchlistItem
        fields = ("id", "stock", "stock_id", "notes", "added_at")

class WatchlistSerializer(serializers.ModelSerializer):
    items = WatchlistItemSerializer(many=True, read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = Watchlist
        fields = ("id", "name", "is_default", "items_count", "items", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
