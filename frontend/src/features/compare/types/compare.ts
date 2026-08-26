import type { Stock } from "../../stocks/types/stock";
import type { StockForecast } from "../../forecasts/types/forecast";

export interface CompareStockData {
  stock: Stock;
  forecast: StockForecast;
  performanceSeries: number[]; // % return points
  color: string;
}
