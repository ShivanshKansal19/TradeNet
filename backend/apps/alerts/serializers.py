from rest_framework import serializers
from .models import Alert
from apps.stocks.serializers import StockSerializer

class AlertSerializer(serializers.ModelSerializer):
    stock_details = StockSerializer(source='stock', read_only=True)

    class Meta:
        model = Alert
        fields = ['id', 'stock', 'stock_details', 'alert_type', 'target_value', 'is_active', 'is_triggered', 'created_at']
        read_only_fields = ['id', 'is_triggered', 'created_at']
