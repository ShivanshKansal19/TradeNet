import numpy as np
from typing import Dict, Any

def calculate_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.mean(np.abs(y_true - y_pred)))

def calculate_directional_accuracy(y_true_returns: np.ndarray, y_pred_returns: np.ndarray) -> float:
    correct_direction = np.sign(y_true_returns) == np.sign(y_pred_returns)
    return float(np.mean(correct_direction) * 100)
