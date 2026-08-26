from rest_framework import serializers
from .models import Portfolio, PortfolioHolding, Transaction
from apps.stocks.serializers import StockSummarySerializer

class TransactionSerializer(serializers.ModelSerializer):
    stock = StockSummarySerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True, required=False)
    symbol = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Transaction
        fields = ("id", "stock", "stock_id", "symbol", "transaction_type", "quantity", "price", "notes", "executed_at")
        read_only_fields = ("id", "executed_at")

class PortfolioHoldingSerializer(serializers.ModelSerializer):
    stock = StockSummarySerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True, required=False)
    symbol = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = PortfolioHolding
        fields = ("id", "stock", "stock_id", "symbol", "quantity", "average_buy_price", "updated_at")
        read_only_fields = ("id", "updated_at")

class PortfolioSerializer(serializers.ModelSerializer):
    holdings = PortfolioHoldingSerializer(many=True, read_only=True)
    holdings_count = serializers.IntegerField(source="holdings.count", read_only=True)

    class Meta:
        model = Portfolio
        fields = ("id", "name", "description", "holdings_count", "holdings", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")
