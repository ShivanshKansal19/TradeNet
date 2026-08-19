import pandas as pd
from typing import Dict, Any
from .features import extract_price_returns, extract_technical_features
from .models import ProphetStockModel, NaiveBaselineModel
from .validation import WalkForwardValidator

class ForecastPipeline:
    """End-to-end pipeline connecting feature extraction, model inference, and validation."""

    def __init__(self, model_version: str = 'v1.0-prophet'):
        self.model_version = model_version
        self.validator = WalkForwardValidator()
        self.model = ProphetStockModel()

    def run_for_stock(self, symbol: str, price_history_df: pd.DataFrame) -> Dict[str, Any]:
        """Execute feature engineering, validation, and forecast generation."""
        # 1. Feature extraction
        tech_features = extract_technical_features(price_history_df)
        combined_df = pd.concat([price_history_df, tech_features], axis=1)

        # 2. Walk-forward backtesting
        metrics = self.validator.evaluate(combined_df)

        # 3. Multi-horizon forecasting
        forecast_5d = self.model.fit_predict(price_history_df, periods=5)

        return {
            'symbol': symbol,
            'model_version': self.model_version,
            'metrics': metrics,
            'forecast': forecast_5d,
        }
