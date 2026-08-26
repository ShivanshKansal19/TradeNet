import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Briefcase, Plus, Loader2 } from "lucide-react";
import {
  PortfolioOverviewCards,
  HoldingsTable,
  AddHoldingModal,
  BenchmarkComparison,
  PortfolioSwitcher,
  CreatePortfolioModal,
  portfolioService,
  calculatePortfolioSummary,
  type PortfolioItem,
  type PortfolioAnalytics,
  type Holding,
  type PortfolioSummary,
  type CreatePortfolioInput,
} from "../features/portfolios";
import AllocationChart, { type AllocationItem } from "../components/charts/AllocationChart";

const SECTOR_COLORS: Record<string, string> = {
  Energy: "#10b981",
  Technology: "#6366f1",
  Banking: "#3b82f6",
  Automobile: "#f59e0b",
  FMCG: "#ec4899",
  Diversified: "#8b5cf6",
  Healthcare: "#06b6d4",
  Finance: "#3b82f6",
};

export default function PortfolioPage() {
  const { portfolioId } = useParams<{ portfolioId?: string }>();
  const navigate = useNavigate();

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [activePortfolio, setActivePortfolio] = useState<PortfolioItem | null>(null);
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all portfolios for user
  const loadPortfolios = useCallback(async () => {
    try {
      setError(null);
      const data = await portfolioService.getPortfolios();
      setPortfolios(data);
      return data;
    } catch (err: any) {
      console.error("Failed to fetch portfolios:", err);
      setError("Unable to load portfolios. Please try again.");
      return [];
    }
  }, []);

  // Fetch analytics for designated portfolio ID
  const loadAnalytics = useCallback(async (targetId: number | string) => {
    try {
      setLoadingAnalytics(true);
      const data = await portfolioService.getPortfolioAnalytics(targetId);
      setAnalytics(data);
    } catch (err: any) {
      console.error("Failed to load portfolio analytics:", err);
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Initial load and URL routing logic
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoading(true);
      const userPortfolios = await loadPortfolios();
      if (!isMounted) return;

      if (userPortfolios.length === 0) {
        setActivePortfolio(null);
        setAnalytics(null);
        setLoading(false);
        return;
      }

      if (portfolioId) {
        const found = userPortfolios.find((p) => String(p.id) === portfolioId);
        if (found) {
          setActivePortfolio(found);
          await loadAnalytics(found.id);
        } else {
          // If portfolio ID in URL doesn't exist for user, redirect to first portfolio
          navigate(`/portfolio/${userPortfolios[0].id}`, { replace: true });
        }
      } else {
        // Automatic redirect from /portfolio to first portfolio /portfolio/:id
        navigate(`/portfolio/${userPortfolios[0].id}`, { replace: true });
      }

      setLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [portfolioId, loadPortfolios, loadAnalytics, navigate]);

  const handleSelectPortfolio = (p: PortfolioItem) => {
    navigate(`/portfolio/${p.id}`);
  };

  const handleCreatePortfolio = async (input: CreatePortfolioInput) => {
    const created = await portfolioService.createPortfolio(input);
    await loadPortfolios();
    navigate(`/portfolio/${created.id}`);
  };

  const handleDeletePortfolio = async (p: PortfolioItem) => {
    try {
      await portfolioService.deletePortfolio(p.id);
      const remaining = await loadPortfolios();
      if (String(activePortfolio?.id) === String(p.id)) {
        if (remaining.length > 0) {
          navigate(`/portfolio/${remaining[0].id}`);
        } else {
          navigate("/portfolio");
        }
      }
    } catch (err: any) {
      console.error("Failed to delete portfolio:", err);
      alert("Failed to delete portfolio.");
    }
  };

  const handleAddHolding = async (newHolding: Holding) => {
    if (!activePortfolio) return;
    try {
      await portfolioService.addHolding(activePortfolio.id, {
        symbol: newHolding.symbol,
        quantity: newHolding.quantity,
        average_buy_price: newHolding.averageBuyPrice,
      });
      await loadAnalytics(activePortfolio.id);
      await loadPortfolios();
    } catch (err: any) {
      console.error("Failed to add holding:", err);
      alert("Failed to add holding to portfolio.");
    }
  };

  const handleRemoveHolding = async (symbol: string) => {
    if (!activePortfolio) return;
    try {
      await portfolioService.removeHolding(activePortfolio.id, { symbol });
      await loadAnalytics(activePortfolio.id);
      await loadPortfolios();
    } catch (err: any) {
      console.error("Failed to remove holding:", err);
      alert("Failed to remove holding from portfolio.");
    }
  };

  // Convert analytics holdings to component holdings format
  const holdings: Holding[] = (analytics?.holdings || []).map((h) => ({
    id: h.id,
    symbol: h.symbol,
    name: h.name,
    sector: h.sector,
    quantity: h.quantity,
    averageBuyPrice: h.average_buy_price,
    currentPrice: h.current_price,
    investedValue: h.invested_value,
    currentValue: h.current_value,
    pnl: h.pnl,
    pnlPercent: h.pnl_percent,
  }));

  const summary: PortfolioSummary = analytics
    ? {
        totalInvested: analytics.total_invested,
        currentValue: analytics.total_current_value,
        totalPnl: analytics.total_pnl,
        totalPnlPercent: analytics.total_return_percent,
        todayPnl: analytics.total_current_value * 0.0142,
        todayPnlPercent: 1.42,
        cashBalance: 45000,
      }
    : calculatePortfolioSummary(holdings);

  // Compute sector allocation
  const allocationItems: AllocationItem[] =
    analytics && analytics.sector_allocations.length > 0
      ? analytics.sector_allocations.map((s) => ({
          label: s.sector,
          value: s.value,
          color: SECTOR_COLORS[s.sector] || "#10b981",
        }))
      : [];

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-sm font-medium">Loading portfolios...</span>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/60 p-12 text-center backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
          <Briefcase size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">No Portfolios Found</h2>
        <p className="mt-2 max-w-md text-xs text-zinc-400">
          Create your first custom portfolio to track equity positions, calculate P&L, and evaluate alpha performance.
        </p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-lg"
          id="empty-create-portfolio-button"
        >
          <Plus size={16} /> Create Portfolio
        </button>

        <CreatePortfolioModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreatePortfolio={handleCreatePortfolio}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Portfolio Tracker</h1>

            {/* Active Portfolio Switcher Dropdown */}
            <PortfolioSwitcher
              portfolios={portfolios}
              activePortfolio={activePortfolio}
              onSelectPortfolio={handleSelectPortfolio}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onDeletePortfolio={handleDeletePortfolio}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {activePortfolio?.description || "Track your equity holdings, evaluate risk and sector concentration, and measure alpha vs NIFTY 50"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 px-3.5 py-2 text-xs font-semibold transition shadow-sm"
            id="header-new-portfolio-btn"
          >
            <Plus size={14} /> New Portfolio
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold transition shadow-md"
            id="header-add-transaction-btn"
          >
            <Plus size={15} /> Add Transaction
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          {error}
        </div>
      )}

      {loadingAnalytics ? (
        <div className="flex h-64 items-center justify-center text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Add Holding Modal */}
      <AddHoldingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHolding={handleAddHolding}
      />

      {/* Create Portfolio Modal */}
      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePortfolio={handleCreatePortfolio}
      />
    </div>
  );
}
