from rest_framework import serializers
from .models import TechnicalIndicator

class TechnicalIndicatorSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source='stock.symbol', read_only=True)

    class Meta:
        model = TechnicalIndicator
        fields = ['symbol', 'date', 'rsi_14', 'macd', 'macd_signal', 'macd_hist', 'sma_20', 'sma_50', 'sma_200', 'atr_14']
