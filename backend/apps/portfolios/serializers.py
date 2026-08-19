from rest_framework import serializers
from .models import Portfolio, PortfolioHolding
from apps.stocks.serializers import StockSerializer

class PortfolioHoldingSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)

    class Meta:
        model = PortfolioHolding
        fields = ['id', 'stock', 'quantity', 'average_buy_price', 'last_updated']

class PortfolioSerializer(serializers.ModelSerializer):
    holdings = PortfolioHoldingSerializer(many=True, read_only=True)

    class Meta:
        model = Portfolio
        fields = ['id', 'name', 'holdings', 'created_at']
