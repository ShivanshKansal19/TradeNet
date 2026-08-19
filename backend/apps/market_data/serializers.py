from rest_framework import serializers
from .models import Sector, MarketIndex, SectorPerformance

class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ['id', 'sector_name']

class MarketIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketIndex
        fields = ['symbol', 'name', 'current_value', 'change', 'percent_change', 'updated_at']

class SectorPerformanceSerializer(serializers.ModelSerializer):
    sector_name = serializers.CharField(source='sector.sector_name', read_only=True)

    class Meta:
        model = SectorPerformance
        fields = ['sector_name', 'date', 'percent_change', 'advances', 'declines']
