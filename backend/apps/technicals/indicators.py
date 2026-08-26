import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

def compute_technical_indicators_df(df: pd.DataFrame) -> pd.DataFrame:
    """Computes full suite of technical indicators on a DataFrame containing
    'open', 'high', 'low', 'close', 'volume' columns sorted chronologically.
    """
    if df.empty or len(df) < 5:
        return df

    data = df.copy()
    close = data["close"]
    high = data["high"]
    low = data["low"]

    # 1. Moving Averages
    data["sma_20"] = close.rolling(window=20, min_periods=1).mean()
    data["sma_50"] = close.rolling(window=50, min_periods=1).mean()
    data["sma_200"] = close.rolling(window=200, min_periods=1).mean()
    data["ema_20"] = close.ewm(span=20, adjust=False).mean()

    # 2. Bollinger Bands
    rolling_std = close.rolling(window=20, min_periods=1).std().fillna(0)
    data["upper_band"] = data["sma_20"] + (rolling_std * 2)
    data["lower_band"] = data["sma_20"] - (rolling_std * 2)

    # 3. RSI (14)
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=13, adjust=False).mean()
    avg_loss = loss.ewm(com=13, adjust=False).mean()
    rs = avg_gain / (avg_loss + 1e-9)
    data["rsi_14"] = 100 - (100 / (1 + rs))

    # 4. MACD (12, 26, 9)
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    data["macd"] = ema_12 - ema_26
    data["macd_signal"] = data["macd"].ewm(span=9, adjust=False).mean()
    data["macd_hist"] = data["macd"] - data["macd_signal"]

    # 5. ATR (14)
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    data["atr_14"] = tr.rolling(window=14, min_periods=1).mean()

    # 6. Overall Signal Summary
    signals = []
    for idx, row in data.iterrows():
        bull_score = 0
        bear_score = 0

        # RSI signals
        rsi = row.get("rsi_14", 50)
        if rsi < 30:
            bull_score += 2  # Oversold
        elif rsi > 70:
            bear_score += 2  # Overbought
        elif rsi > 50:
            bull_score += 1
        else:
            bear_score += 1

        # MACD signals
        macd_h = row.get("macd_hist", 0)
        if macd_h > 0:
            bull_score += 2
        elif macd_h < 0:
            bear_score += 2

        # Price vs MA signals
        c = row["close"]
        sma20 = row.get("sma_20", c)
        sma50 = row.get("sma_50", c)
        if c > sma20:
            bull_score += 1
        else:
            bear_score += 1
        if sma20 > sma50:
            bull_score += 1
        else:
            bear_score += 1

        if bull_score - bear_score >= 3:
            signals.append("STRONG BUY")
        elif bull_score - bear_score >= 1:
            signals.append("BUY")
        elif bear_score - bull_score >= 3:
            signals.append("STRONG SELL")
        elif bear_score - bull_score >= 1:
            signals.append("SELL")
        else:
            signals.append("NEUTRAL")

    data["signal_summary"] = signals
    return data
