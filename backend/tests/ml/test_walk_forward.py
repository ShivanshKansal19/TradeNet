import pytest
import pandas as pd
import numpy as np
from ml.pipeline import MLForecastPipeline

def test_ml_pipeline_run_for_stock():
    np.random.seed(42)
    n = 150
    prices = 1000.0 + np.cumsum(np.random.randn(n) * 5)
    
    df = pd.DataFrame({
        "open": prices - 2,
        "high": prices + 5,
        "low": prices - 5,
        "close": prices,
        "volume": np.random.randint(50000, 200000, n),
    })

    pipeline = MLForecastPipeline(horizons=[1, 5, 20])
    result = pipeline.run_for_stock("TESTSTOCK", df)

    assert result["symbol"] == "TESTSTOCK"
    assert "current_price" in result
    assert len(result["forecasts"]) == 3

    for f in result["forecasts"]:
        assert f["horizon_days"] in [1, 5, 20]
        assert f["target_price_lower"] <= f["target_price_mean"] <= f["target_price_upper"]
        assert 0.0 <= f["prob_positive"] <= 1.0
        assert f["confidence_label"] in ["HIGH", "MEDIUM", "LOW"]
        assert "model_mae" in f
        assert "baseline_mae" in f
