// Forecasts Feature Module
export interface ForecastData {
  symbol: string;
  horizon_days: number;
  probability_positive: number;
  expected_return_pct: number;
  confidence_label: "high" | "medium" | "low";
}
