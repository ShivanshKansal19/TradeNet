import pandas as pd
from typing import List

def extract_price_returns(df: pd.DataFrame, horizons: List[int] = [1, 5, 20]) -> pd.DataFrame:
    """Calculate time-safe percentage price returns without look-ahead bias."""
    features = pd.DataFrame(index=df.index)
    for h in horizons:
        features[f'return_{h}d'] = df['close'].pct_change(h)
    return features
