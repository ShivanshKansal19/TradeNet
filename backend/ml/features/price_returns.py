import pandas as pd
import numpy as np

def compute_price_returns(df: pd.DataFrame) -> pd.DataFrame:
    """Calculates strictly time-safe backward price returns.
    All features use only current and prior data points.
    """
    data = df.copy()
    close = data["close"]

    # Backward price returns (Features X)
    data["ret_1d"] = close.pct_change(1)
    data["ret_5d"] = close.pct_change(5)
    data["ret_10d"] = close.pct_change(10)
    data["ret_20d"] = close.pct_change(20)

    # Rolling price volatility
    data["volatility_10d"] = data["ret_1d"].rolling(window=10, min_periods=2).std()
    data["volatility_20d"] = data["ret_1d"].rolling(window=20, min_periods=2).std()

    # Volume change features
    vol = data["volume"]
    vol_sma20 = vol.rolling(window=20, min_periods=1).mean()
    data["vol_ratio_20d"] = vol / (vol_sma20 + 1e-6)
    data["is_volume_spike"] = (data["vol_ratio_20d"] > 1.8).astype(float)

    return data
