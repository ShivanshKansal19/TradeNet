import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { GitCompare, Loader2 } from "lucide-react";
import { CompareStockSelector, CompareTable, fetchComparisonData, type CompareStockData } from "../features/compare";
import ComparisonChart from "../components/charts/ComparisonChart";

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const initialStock1 = searchParams.get("stock1") || "RELIANCE";
  const initialStock2 = searchParams.get("stock2") || "TCS";

  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([initialStock1, initialStock2]);
  const [compareData, setCompareData] = useState<CompareStockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchComparisonData(selectedSymbols)
      .then((data) => {
        if (isMounted) {
          setCompareData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSymbols]);

  const handleAddSymbol = (symbol: string) => {
    if (!selectedSymbols.includes(symbol) && selectedSymbols.length < 4) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    if (selectedSymbols.length > 2) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    }
  };

  const chartSeries = compareData.map((d) => ({
    symbol: d.stock.symbol,
    name: d.stock.name,
    color: d.color,
    data: d.performanceSeries,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GitCompare size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Stock Comparison</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Compare 2 to 4 Indian stocks side-by-side on performance, valuation, and AI forecast targets
          </p>
        </div>

        {/* Stock Selector */}
        <CompareStockSelector
          selectedSymbols={selectedSymbols}
          onAddSymbol={handleAddSymbol}
          onRemoveSymbol={handleRemoveSymbol}
        />
      </div>

      {isLoading ? (
        <div className="flex h-72 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <>
          {/* Performance Comparison Chart */}
          <ComparisonChart series={chartSeries} />

          {/* Detailed Side-by-Side Comparison Table */}
          <CompareTable data={compareData} />
        </>
      )}
    </div>
  );
}
