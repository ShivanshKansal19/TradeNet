import React, { useState, useEffect } from "react";
import { Briefcase, Plus } from "lucide-react";
import {
  PortfolioOverviewCards,
  HoldingsTable,
  AddHoldingModal,
  BenchmarkComparison,
  getSavedHoldings,
  saveHoldings,
  calculatePortfolioSummary,
  type Holding,
} from "../features/portfolios";
import AllocationChart, { type AllocationItem } from "../components/charts/AllocationChart";

const SECTOR_COLORS: Record<string, string> = {
  Energy: "#10b981",
  Technology: "#6366f1",
  Banking: "#3b82f6",
  Automobile: "#f59e0b",
  FMCG: "#ec4899",
  Diversified: "#8b5cf6",
};

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setHoldings(getSavedHoldings());
  }, []);

  const summary = calculatePortfolioSummary(holdings);

  const handleAddHolding = (newHolding: Holding) => {
    const existingIndex = holdings.findIndex((h) => h.symbol === newHolding.symbol);
    let updated: Holding[];

    if (existingIndex >= 0) {
      // Update quantity and recalculate weighted average buy price
      const existing = holdings[existingIndex];
      const totalQty = existing.quantity + newHolding.quantity;
      const totalCost = existing.quantity * existing.averageBuyPrice + newHolding.quantity * newHolding.averageBuyPrice;
      const newAvg = totalCost / totalQty;

      updated = [...holdings];
      updated[existingIndex] = {
        ...existing,
        quantity: totalQty,
        averageBuyPrice: newAvg,
      };
    } else {
      updated = [...holdings, newHolding];
    }

    setHoldings(updated);
    saveHoldings(updated);
  };

  const handleRemoveHolding = (symbol: string) => {
    const updated = holdings.filter((h) => h.symbol !== symbol);
    setHoldings(updated);
    saveHoldings(updated);
  };

  // Compute sector allocation
  const sectorAllocationMap: Record<string, number> = {};
  holdings.forEach((h) => {
    const val = h.quantity * h.currentPrice;
    sectorAllocationMap[h.sector] = (sectorAllocationMap[h.sector] || 0) + val;
  });

  const allocationItems: AllocationItem[] = Object.entries(sectorAllocationMap).map(([sector, val]) => ({
    label: sector,
    value: val,
    color: SECTOR_COLORS[sector] || "#10b981",
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Portfolio Tracker</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Track your equity holdings, evaluate risk and sector concentration, and measure alpha vs NIFTY 50
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold transition shadow-md self-start sm:self-auto"
        >
          <Plus size={15} /> Add Transaction
        </button>
      </div>

      {/* KPI Overview Cards */}
      <PortfolioOverviewCards summary={summary} />

      {/* 2-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationChart
          items={allocationItems}
          title="Sector Allocation"
          totalLabel="Equity Value"
          totalValue={`₹${(summary.currentValue / 100000).toFixed(2)}L`}
        />
        <BenchmarkComparison
          portfolioReturnPct={summary.totalPnlPercent}
          benchmarkName="NIFTY 50"
          benchmarkReturnPct={14.8}
        />
      </div>

      {/* Holdings Details Table */}
      <HoldingsTable holdings={holdings} onRemoveHolding={handleRemoveHolding} />

      {/* Add Holding Modal */}
      <AddHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddHolding={handleAddHolding}
      />
    </div>
  );
}
