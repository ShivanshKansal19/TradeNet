import pytest
import pandas as pd
import numpy as np
from apps.technicals.indicators import compute_technical_indicators_df

def test_compute_technical_indicators_columns():
    prices = [100.0 + i + (i % 3) for i in range(50)]
    df = pd.DataFrame({
        "open": prices,
        "high": [p + 2.0 for p in prices],
        "low": [p - 2.0 for p in prices],
        "close": prices,
        "volume": [100000 for _ in prices],
    })

    result = compute_technical_indicators_df(df)

    assert "sma_20" in result.columns
    assert "sma_50" in result.columns
    assert "rsi_14" in result.columns
    assert "macd" in result.columns
    assert "macd_signal" in result.columns
    assert "macd_hist" in result.columns
    assert "atr_14" in result.columns
    assert "upper_band" in result.columns
    assert "lower_band" in result.columns
    assert "signal_summary" in result.columns

    # Check bounds
    valid_rsi = result["rsi_14"].dropna()
    assert (valid_rsi >= 0).all() and (valid_rsi <= 100).all()

    # Check signal values
    signals = set(result["signal_summary"].unique())
    valid_signals = {"STRONG BUY", "BUY", "NEUTRAL", "SELL", "STRONG SELL"}
    assert signals.issubset(valid_signals)
