from rest_framework import serializers
from .models import Stock, StockPrice, StockFundamental

class StockPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPrice
        fields = ("date", "open_price", "high_price", "low_price", "close_price", "volume", "adjusted_close")

class StockFundamentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockFundamental
        fields = (
            "pe_ratio", "pb_ratio", "eps", "roe", "debt_to_equity",
            "dividend_yield", "book_value", "week_52_high", "week_52_low", "updated_at"
        )

class StockSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = (
            "id", "symbol", "name", "exchange", "sector", "industry",
            "market_cap", "current_price", "day_change", "day_change_percent"
        )

class StockDetailSerializer(serializers.ModelSerializer):
    fundamentals = StockFundamentalSerializer(read_only=True)
    latest_price = serializers.SerializerMethodField()

    class Meta:
        model = Stock
        fields = (
            "id", "symbol", "name", "exchange", "sector", "industry",
            "market_cap", "current_price", "day_change", "day_change_percent",
            "is_active", "fundamentals", "latest_price", "updated_at"
        )

    def get_latest_price(self, obj):
        price = obj.prices.first()
        if price:
            return StockPriceSerializer(price).data
        return None
