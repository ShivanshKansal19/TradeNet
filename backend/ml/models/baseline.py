import numpy as np
import pandas as pd
from typing import Dict, Any

class NaiveBaselineModel:
    """Benchmark model predicting zero future change (last-price persistence)."""

    def __init__(self, horizon_days: int = 5):
        self.horizon_days = horizon_days
        self.version = "baseline-v1.0"

    def predict(self, current_price: float) -> Dict[str, Any]:
        return {
            "model_name": "NaiveLastPriceBaseline",
            "model_version": self.version,
            "horizon_days": self.horizon_days,
            "target_price_mean": float(current_price),
            "expected_return": 0.0,
            "prob_positive": 0.50,
        }

    def evaluate(self, actual_prices: np.ndarray, current_prices: np.ndarray) -> Dict[str, float]:
        """Calculates Baseline MAE (difference between actual future price and current price)."""
        if len(actual_prices) == 0:
            return {"baseline_mae": 0.0}
        mae = float(np.mean(np.abs(actual_prices - current_prices)))
        return {"baseline_mae": round(mae, 4)}
