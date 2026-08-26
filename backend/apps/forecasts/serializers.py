from rest_framework import serializers
from .models import Forecast, ForecastRun

class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = (
            "id", "horizon_days", "current_price", "target_price_mean",
            "target_price_lower", "target_price_upper", "expected_return_percent",
            "prob_positive", "confidence_label", "baseline_mae", "model_mae",
            "directional_accuracy", "model_version", "generated_at"
        )

class ForecastRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastRun
        fields = (
            "id", "run_date", "model_name", "model_version", "horizon_days",
            "sample_size", "baseline_mae", "model_mae", "directional_accuracy",
            "features_used", "created_at"
        )
