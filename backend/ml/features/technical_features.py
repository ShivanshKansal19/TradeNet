import pandas as pd
import numpy as np

def compute_technical_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculates time-safe normalized technical features."""
    data = df.copy()
    close = data["close"]
    high = data["high"]
    low = data["low"]

    # Moving Average Distances
    sma_20 = close.rolling(window=20, min_periods=1).mean()
    sma_50 = close.rolling(window=50, min_periods=1).mean()
    sma_200 = close.rolling(window=200, min_periods=1).mean()

    data["dist_sma_20"] = (close - sma_20) / (sma_20 + 1e-6)
    data["dist_sma_50"] = (close - sma_50) / (sma_50 + 1e-6)
    data["dist_sma_200"] = (close - sma_200) / (sma_200 + 1e-6)
    data["sma_cross_20_50"] = ((sma_20 - sma_50) / (sma_50 + 1e-6))

    # RSI (normalized 0 to 1)
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=13, adjust=False).mean()
    avg_loss = loss.ewm(com=13, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    rsi = 100 - (100 / (1 + rs))
    data["feat_rsi_14"] = (rsi - 50.0) / 50.0  # Center around 0 (-1 to 1)

    # MACD momentum normalized
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    macd = ema_12 - ema_26
    macd_signal = macd.ewm(span=9, adjust=False).mean()
    data["feat_macd_hist"] = (macd - macd_signal) / (close + 1e-6)

    # ATR Volatility Normalized
    prev_close = close.shift(1)
    tr = pd.concat([high - low, (high - prev_close).abs(), (low - prev_close).abs()], axis=1).max(axis=1)
    atr = tr.rolling(window=14, min_periods=1).mean()
    data["feat_atr_ratio"] = atr / (close + 1e-6)

    return data
