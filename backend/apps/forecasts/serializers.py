from rest_framework import serializers
from .models import Forecast, ForecastRun

class ForecastRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastRun
        fields = ['id', 'run_date', 'model_version', 'baseline_mae', 'model_mae', 'direction_accuracy']

class ForecastSerializer(serializers.ModelSerializer):
    symbol = serializers.CharField(source='stock.symbol', read_only=True)
    run_details = ForecastRunSerializer(source='forecast_run', read_only=True)

    class Meta:
        model = Forecast
        fields = [
            'symbol', 'date_generated', 'horizon_days', 'probability_positive',
            'expected_return_pct', 'lower_bound_price', 'upper_bound_price',
            'confidence_label', 'run_details'
        ]
