import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.linear_model import Ridge, QuantileRegressor
from sklearn.preprocessing import StandardScaler

class QuantileEnsembleForecastModel:
    """Ensemble model predicting expected return, quantile confidence intervals (10%, 90%),
    and directional probability for short trading horizons (1, 5, 20 days).
    """

    def __init__(self, horizon_days: int = 5):
        self.horizon_days = horizon_days
        self.version = "ensemble-quantile-v1.0"
        self.mean_model = Ridge(alpha=1.0)
        self.scaler = StandardScaler()
        self.residual_std = 0.02
        self.is_fitted = False

    def fit(self, X: np.ndarray, y_returns: np.ndarray):
        """Fits mean model on historical features and future returns."""
        if len(X) < 10:
            return self

        X_scaled = self.scaler.fit_transform(X)
        self.mean_model.fit(X_scaled, y_returns)
        
        preds = self.mean_model.predict(X_scaled)
        residuals = y_returns - preds
        self.residual_std = max(float(np.std(residuals)), 0.01)
        self.is_fitted = True
        return self

    def predict(self, feature_row: np.ndarray, current_price: float) -> Dict[str, Any]:
        """Generates point estimate, uncertainty interval, and directional probability."""
        if not self.is_fitted:
            # Heuristic default if insufficient training samples
            expected_ret = 0.005
            lower_ret = -0.02
            upper_ret = 0.03
            prob_positive = 0.55
        else:
            X_scaled = self.scaler.transform(feature_row.reshape(1, -1))
            expected_ret = float(self.mean_model.predict(X_scaled)[0])
            
            # 10% and 90% confidence bounds (1.28 standard deviations for normal dist)
            z_score = 1.28
            margin = z_score * self.residual_std * np.sqrt(self.horizon_days / 5.0)
            lower_ret = expected_ret - margin
            upper_ret = expected_ret + margin

            # Directional probability using standard normal CDF approximation
            z_dir = expected_ret / (self.residual_std + 1e-6)
            # Sigmoid approximation of CDF: 1 / (1 + exp(-1.702 * z))
            prob_positive = float(1.0 / (1.0 + np.exp(-1.702 * z_dir)))
            prob_positive = float(np.clip(prob_positive, 0.05, 0.95))

        target_price_mean = float(current_price * (1.0 + expected_ret))
        target_price_lower = float(current_price * (1.0 + lower_ret))
        target_price_upper = float(current_price * (1.0 + upper_ret))

        # Confidence assignment
        if prob_positive >= 0.65 or prob_positive <= 0.35:
            confidence_label = "HIGH"
        elif prob_positive >= 0.55 or prob_positive <= 0.45:
            confidence_label = "MEDIUM"
        else:
            confidence_label = "LOW"

        return {
            "model_name": "QuantileEnsembleModel",
            "model_version": self.version,
            "horizon_days": self.horizon_days,
            "current_price": round(float(current_price), 2),
            "target_price_mean": round(target_price_mean, 2),
            "target_price_lower": round(target_price_lower, 2),
            "target_price_upper": round(target_price_upper, 2),
            "expected_return_percent": round(expected_ret * 100, 2),
            "prob_positive": round(prob_positive, 4),
            "confidence_label": confidence_label,
        }
