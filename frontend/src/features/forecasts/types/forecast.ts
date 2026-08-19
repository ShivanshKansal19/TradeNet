export type HorizonDays = 1 | 5 | 20;

export interface ValidationMetrics {
  model_version: string;
  feature_version: string;
  baseline_mae: number;
  model_mae: number;
  mae_improvement_pct: number;
  directional_accuracy: number; // e.g. 58.4%
  test_window_sessions: number;
}

export interface StockForecast {
  symbol: string;
  horizon_days: HorizonDays;
  date_generated: string;
  current_price: number;
  expected_target_price: number;
  expected_return_pct: number;
  lower_bound_price: number;
  upper_bound_price: number;
  probability_positive: number; // e.g. 64%
  confidence_label: "High" | "Medium" | "Low";
  validation: ValidationMetrics;
}
