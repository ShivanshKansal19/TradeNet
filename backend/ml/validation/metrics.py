import numpy as np
from typing import Dict, Any

def calculate_forecast_metrics(
    actual_returns: np.ndarray,
    predicted_returns: np.ndarray,
    actual_prices: np.ndarray,
    predicted_prices: np.ndarray,
    current_prices: np.ndarray,
) -> Dict[str, float]:
    """Calculates out-of-sample metrics for model vs naive baseline:
    - Model MAE
    - Baseline MAE
    - Directional Accuracy (Hit rate: fraction of correct up/down predictions)
    - MAE Improvement %
    """
    if len(actual_returns) == 0:
        return {
            "model_mae": 0.0,
            "baseline_mae": 0.0,
            "directional_accuracy": 0.50,
            "mae_improvement_pct": 0.0,
        }

    # MAE in price terms
    model_mae = float(np.mean(np.abs(actual_prices - predicted_prices)))
    baseline_mae = float(np.mean(np.abs(actual_prices - current_prices)))

    # Directional hit rate
    actual_direction = (actual_returns > 0).astype(int)
    predicted_direction = (predicted_returns > 0).astype(int)
    dir_acc = float(np.mean(actual_direction == predicted_direction))

    # Improvement over baseline
    improvement = ((baseline_mae - model_mae) / (baseline_mae + 1e-6)) * 100.0 if baseline_mae > 0 else 0.0

    return {
        "model_mae": round(model_mae, 4),
        "baseline_mae": round(baseline_mae, 4),
        "directional_accuracy": round(dir_acc, 4),
        "mae_improvement_pct": round(improvement, 2),
    }
