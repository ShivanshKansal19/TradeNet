import pandas as pd
import numpy as np

def compute_macro_features(df: pd.DataFrame, index_df: pd.DataFrame = None) -> pd.DataFrame:
    """Combines stock dataframe with benchmark index returns (e.g. NIFTY 50)."""
    data = df.copy()
    if index_df is not None and not index_df.empty and "close" in index_df.columns:
        index_ret = index_df["close"].pct_change(1)
        data["index_ret_1d"] = index_ret
        data["index_ret_5d"] = index_df["close"].pct_change(5)
    else:
        # Default placeholder when standalone
        data["index_ret_1d"] = 0.0
        data["index_ret_5d"] = 0.0
    return data
