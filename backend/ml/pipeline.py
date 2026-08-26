import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import date
from .features.price_returns import compute_price_returns
from .features.technical_features import compute_technical_features
from .features.macro_features import compute_macro_features
from .models.ensemble import QuantileEnsembleForecastModel
from .models.baseline import NaiveBaselineModel
from .validation.walk_forward import WalkForwardBacktester

FEATURE_COLUMNS = [
    "ret_1d", "ret_5d", "ret_10d", "ret_20d",
    "volatility_10d", "volatility_20d", "vol_ratio_20d", "is_volume_spike",
    "dist_sma_20", "dist_sma_50", "dist_sma_200", "sma_cross_20_50",
    "feat_rsi_14", "feat_macd_hist", "feat_atr_ratio",
]

class MLForecastPipeline:
    """End-to-end ML pipeline for feature creation, walk-forward testing,
    and multi-horizon stock price forecasting.
    """

    def __init__(self, horizons: List[int] = None):
        self.horizons = horizons or [1, 5, 20]
        self.feature_cols = FEATURE_COLUMNS

    def build_features(self, ohlcv_df: pd.DataFrame, index_df: pd.DataFrame = None) -> pd.DataFrame:
        """Applies all time-safe feature transformations to raw OHLCV DataFrame."""
        if ohlcv_df.empty:
            return pd.DataFrame()
        df = compute_price_returns(ohlcv_df)
        df = compute_technical_features(df)
        df = compute_macro_features(df, index_df=index_df)
        return df

    def run_for_stock(
        self, stock_symbol: str, ohlcv_df: pd.DataFrame, index_df: pd.DataFrame = None
    ) -> Dict[str, Any]:
        """Runs feature engineering, model fitting, walk-forward validation,
        and predictions for 1d, 5d, and 20d horizons.
        """
        if ohlcv_df.empty or len(ohlcv_df) < 30:
            return {}

        df = self.build_features(ohlcv_df, index_df=index_df)
        clean_df = df.dropna(subset=self.feature_cols).reset_index(drop=True)
        if len(clean_df) < 20:
            return {}

        current_price = float(clean_df["close"].iloc[-1])
        latest_features = clean_df[self.feature_cols].iloc[-1].values

        horizon_forecasts = []
        for h in self.horizons:
            # 1. Forward target calculation for training
            close_vals = clean_df["close"].values
            fwd_returns = (np.roll(close_vals, -h) - close_vals) / close_vals
            
            # Train only on data up to -h
            train_limit = len(clean_df) - h
            if train_limit > 15:
                X_train = clean_df[self.feature_cols].iloc[:train_limit].values
                y_train = fwd_returns[:train_limit]
            else:
                X_train = clean_df[self.feature_cols].values
                y_train = fwd_returns

            # 2. Fit model & predict current state
            model = QuantileEnsembleForecastModel(horizon_days=h)
            model.fit(X_train, y_train)
            pred = model.predict(latest_features, current_price)

            # 3. Walk-Forward Backtesting for robust validation scores
            backtester = WalkForwardBacktester(initial_train_size=min(80, max(20, int(len(clean_df) * 0.6))), horizon_days=h)
            val_metrics = backtester.evaluate(clean_df, self.feature_cols)

            pred["baseline_mae"] = val_metrics.get("baseline_mae", 0.0)
            pred["model_mae"] = val_metrics.get("model_mae", 0.0)
            pred["directional_accuracy"] = val_metrics.get("directional_accuracy", 0.50)
            pred["sample_size"] = val_metrics.get("sample_size", len(clean_df))
            pred["features_used"] = self.feature_cols

            horizon_forecasts.append(pred)

        return {
            "symbol": stock_symbol,
            "current_price": current_price,
            "forecasts": horizon_forecasts,
        }
