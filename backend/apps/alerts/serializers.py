from rest_framework import serializers
from .models import Alert, AlertNotification
from apps.stocks.serializers import StockSummarySerializer

class AlertNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertNotification
        fields = ("id", "alert", "message", "is_read", "created_at")

class AlertSerializer(serializers.ModelSerializer):
    stock = StockSummarySerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True, required=False)
    symbol = serializers.CharField(write_only=True, required=False)
    notifications = AlertNotificationSerializer(many=True, read_only=True)

    class Meta:
        model = Alert
        fields = (
            "id", "stock", "stock_id", "symbol", "alert_type",
            "threshold_value", "is_active", "triggered_at", "notifications",
            "created_at", "updated_at"
        )
        read_only_fields = ("id", "triggered_at", "created_at", "updated_at")
