import pandas as pd
import numpy as np

class NaiveBaselineModel:
    """Baseline model assuming future price equals the latest observed price."""

    def predict(self, history: pd.Series, horizon_days: int) -> float:
        return float(history.iloc[-1])
