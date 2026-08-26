from rest_framework import serializers
from .models import MarketIndex, SectorPerformance

class MarketIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketIndex
        fields = ("symbol", "name", "value", "change", "change_percent", "last_updated")

class SectorPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectorPerformance
        fields = ("sector_name", "change_percent", "top_gainer", "top_loser", "market_cap", "last_updated")
