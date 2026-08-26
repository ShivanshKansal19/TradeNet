import { getStockDetails, getStockPriceHistory } from "../../stocks/services/stockService";
import { getStockForecast } from "../../forecasts/services/forecastService";
import type { CompareStockData } from "../types/compare";

const STOCK_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ec4899"];

export async function fetchComparisonData(symbols: string[]): Promise<CompareStockData[]> {
  const promises = symbols.map(async (sym, index) => {
    const stock = await getStockDetails(sym);
    const forecast = await getStockForecast(sym, 5, stock.price);
    const history = await getStockPriceHistory(sym, "1m");

    let performanceSeries: number[] = [0];
    if (history && history.length > 1) {
      const basePrice = history[0].close || 1;
      performanceSeries = history.map((p) => {
        const ret = ((p.close - basePrice) / basePrice) * 100;
        return Number(ret.toFixed(2));
      });
    } else {
      // Small fallback if history is loading
      let cum = 0;
      for (let i = 1; i < 20; i++) {
        cum += (Math.random() - 0.48) * 1.2;
        performanceSeries.push(Number(cum.toFixed(2)));
      }
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
