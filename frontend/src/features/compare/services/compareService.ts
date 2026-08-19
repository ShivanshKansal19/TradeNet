import { getStockDetails } from "../../stocks/services/stockService";
import { getStockForecast } from "../../forecasts/services/forecastService";
import type { CompareStockData } from "../types/compare";

const STOCK_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899"];

export async function fetchComparisonData(symbols: string[]): Promise<CompareStockData[]> {
  const promises = symbols.map(async (sym, index) => {
    const stock = await getStockDetails(sym);
    const forecast = await getStockForecast(sym, 5, stock.price);
    
    // Generate synthetic 30-day normalized performance line
    const performanceSeries: number[] = [0];
    let cum = 0;
    for (let i = 1; i < 30; i++) {
      cum += (Math.random() - 0.48) * 1.5;
      performanceSeries.push(Number(cum.toFixed(2)));
    }

    return {
      stock,
      forecast,
      performanceSeries,
      color: STOCK_COLORS[index % STOCK_COLORS.length],
    };
  });

  return Promise.all(promises);
}
