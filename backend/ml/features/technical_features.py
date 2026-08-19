import pandas as pd
from apps.technicals.indicators import compute_rsi, compute_macd, compute_sma

def extract_technical_features(df: pd.DataFrame) -> pd.DataFrame:
    """Generate time-safe technical indicator features."""
    features = pd.DataFrame(index=df.index)
    features['rsi_14'] = compute_rsi(df['close'], period=14)
    macd_dict = compute_macd(df['close'])
    features['macd'] = macd_dict['macd']
    features['macd_signal'] = macd_dict['signal']
    features['macd_hist'] = macd_dict['hist']
    features['sma_20'] = compute_sma(df['close'], 20)
    features['sma_50'] = compute_sma(df['close'], 50)
    return features
