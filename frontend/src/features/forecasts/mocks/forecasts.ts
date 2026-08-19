import type { StockForecast, HorizonDays } from "../types/forecast";

export function generateMockForecast(symbol: string, horizon: HorizonDays = 5, currentPrice: number = 1420.5): StockForecast {
  const returnRate = horizon === 1 ? 0.65 : horizon === 5 ? 2.40 : 4.80;
  const prob = horizon === 1 ? 59 : horizon === 5 ? 64 : 61;
  const spread = currentPrice * (horizon === 1 ? 0.015 : horizon === 5 ? 0.035 : 0.075);

  const target = currentPrice * (1 + returnRate / 100);

  return {
    symbol,
    horizon_days: horizon,
    date_generated: "2026-08-19",
    current_price: currentPrice,
    expected_target_price: Number(target.toFixed(2)),
    expected_return_pct: returnRate,
    lower_bound_price: Number((target - spread).toFixed(2)),
    upper_bound_price: Number((target + spread).toFixed(2)),
    probability_positive: prob,
    confidence_label: prob >= 60 ? "High" : "Medium",
    validation: {
      model_version: "v1.2-walkforward-prophet",
      feature_version: "fe-v2.0",
      baseline_mae: 14.8,
      model_mae: 11.2,
      mae_improvement_pct: 24.3,
      directional_accuracy: 58.7,
      test_window_sessions: 250,
    },
  };
}
