import pandas as pd
from typing import Dict, Any

class ProphetStockModel:
    """Time-series stock price forecasting using Prophet."""

    def __init__(self):
        self.model = None

    def fit_predict(self, df: pd.DataFrame, periods: int = 5) -> Dict[str, Any]:
        """Fit Prophet model on ['ds', 'y'] and predict specified horizon."""
        try:
            from prophet import Prophet
            prophet_df = df[['date', 'close']].rename(columns={'date': 'ds', 'close': 'y'})
            m = Prophet(daily_seasonality=False, weekly_seasonality=True, yearly_seasonality=True)
            m.fit(prophet_df)
            future = m.make_future_dataframe(periods=periods)
            forecast = m.predict(future)
            latest = forecast.iloc[-1]
            return {
                'predicted_price': float(latest['yhat']),
                'lower_bound': float(latest['yhat_lower']),
                'upper_bound': float(latest['yhat_upper']),
            }
        except Exception as e:
            # Fallback
            last_price = float(df['close'].iloc[-1])
            return {
                'predicted_price': last_price,
                'lower_bound': last_price * 0.95,
                'upper_bound': last_price * 1.05,
            }
