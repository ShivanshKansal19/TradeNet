from rest_framework import serializers
from .models import TechnicalIndicator

class TechnicalIndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnicalIndicator
        fields = (
            "date", "rsi_14", "macd", "macd_signal", "macd_hist",
            "sma_20", "sma_50", "sma_200", "ema_20", "atr_14",
            "upper_band", "lower_band", "signal_summary", "created_at"
        )
