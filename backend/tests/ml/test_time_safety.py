import pytest
import pandas as pd
import numpy as np
from ml.pipeline import MLForecastPipeline

def test_feature_extraction_no_lookahead():
    """Modifying future prices in the series must not change the features computed for earlier dates."""
    np.random.seed(42)
    n = 100
    prices = 100 + np.cumsum(np.random.randn(n))
    
    df1 = pd.DataFrame({
        "open": prices,
        "high": prices + 1,
        "low": prices - 1,
        "close": prices,
        "volume": np.random.randint(1000, 5000, n),
    })

    pipeline = MLForecastPipeline()
    feat1 = pipeline.build_features(df1)

    # Create df2 by changing the last 10 rows drastically
    df2 = df1.copy()
    df2.iloc[90:, df2.columns.get_loc("close")] = df2.iloc[90:]["close"] * 5.0
    feat2 = pipeline.build_features(df2)

    # Features for rows 0 to 89 must be EXACTLY identical between feat1 and feat2
    for col in pipeline.feature_cols:
        val1 = feat1[col].iloc[:89].dropna().values
        val2 = feat2[col].iloc[:89].dropna().values
        np.testing.assert_allclose(val1, val2, err_msg=f"Lookahead bias detected in {col}")
