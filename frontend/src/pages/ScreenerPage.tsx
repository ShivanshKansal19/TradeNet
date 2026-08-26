import { useState, useEffect, useMemo } from "react";
import { ListFilter, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  ScreenerFilterBar,
  ScreenerTable,
  filterScreenerStocks,
  fetchScreenerStocks,
  type ScreenerFilters,
  type ScreenerStockItem,
} from "../features/screener";
import { useAuth, AuthPromptModal } from "../features/auth";
import { AddHoldingModal, portfolioService, type PortfolioItem, type Holding } from "../features/portfolios";
import { getSavedWatchlists, saveWatchlists } from "../features/watchlists/services/watchlistService";

const INITIAL_FILTERS: ScreenerFilters = {
  search: "",
  sector: "all",
  marketCapCategory: "all",
  minMarketCap: 0,
  peCategory: "all",
  pricePerformance: "all",
  minRsi: 0,
  maxRsi: 100,
  forecastTrend: "all",
  minForecastProb: 0,
};

export default function ScreenerPage() {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<ScreenerFilters>(INITIAL_FILTERS);
  const [stocks, setStocks] = useState<ScreenerStockItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Guest Interception Modal State
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<"portfolio" | "watchlist">("portfolio");
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>("");

  // Authenticated Add Holding Modal State
  const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false);
  const [targetHoldingStock, setTargetHoldingStock] = useState<{ symbol: string; price: number } | null>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadStocks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchScreenerStocks();
      setStocks(data);
    } catch (e) {
      console.error("Failed to load screener stocks:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      portfolioService.getPortfolios().then(setPortfolios).catch(() => setPortfolios([]));
    }
  }, [isAuthenticated]);

  // Compute available unique sectors from stocks
  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => {
      if (s.sector && s.sector !== "Diversified") {
        set.add(s.sector);
      }
    });
    return ["all", ...Array.from(set).sort()];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return filterScreenerStocks(stocks, filters);
  }, [stocks, filters]);

  // Action handlers
  const handleAddToPortfolio = (stock: ScreenerStockItem) => {
    if (!isAuthenticated) {
      setSelectedStockSymbol(stock.symbol);
      setAuthPromptAction("portfolio");
      setIsAuthPromptOpen(true);
      return;
    }

    setTargetHoldingStock({ symbol: stock.symbol, price: stock.price ?? 1000 });
    setIsAddHoldingOpen(true);
  };

  const handleAddToWatchlist = (stock: ScreenerStockItem) => {
    if (!isAuthenticated) {
      setSelectedStockSymbol(stock.symbol);
      setAuthPromptAction("watchlist");
      setIsAuthPromptOpen(true);
      return;
    }

    try {
      const currentGroups = getSavedWatchlists();
      const targetGroup = currentGroups[0] || {
        id: "core",
        name: "Core Watchlist",
        items: [],
      };

      const alreadyExists = targetGroup.items.some(
        (item) => item.symbol.toUpperCase() === stock.symbol.toUpperCase()
      );

      if (!alreadyExists) {
        targetGroup.items.push({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price ?? 0,
          change: (stock.price ?? 0) * ((stock.change_percent ?? 0) / 100),
          change_percent: stock.change_percent ?? 0,
          rsi: stock.rsi ?? 50,
          forecast_5d_pct: stock.forecast_5d_pct ?? 2.0,
          forecast_prob: stock.forecast_prob ?? 60,
          sparkline: [stock.price ?? 1000],
        });
        saveWatchlists(currentGroups.length > 0 ? currentGroups : [targetGroup]);
        setFeedbackMessage(`Added ${stock.symbol} to your watchlist.`);
      } else {
        setFeedbackMessage(`${stock.symbol} is already in your watchlist.`);
      }
    } catch {
      setFeedbackMessage(`Saved ${stock.symbol} to watchlist.`);
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleAddHoldingSubmit = async (holding: Holding, targetPortfolioId?: number | string) => {
    const portfolioIdToUse = targetPortfolioId || portfolios[0]?.id;
    if (!portfolioIdToUse) {
      const newPortfolio = await portfolioService.createPortfolio({
        name: "My Portfolio",
        description: "Default Investment Portfolio",
      });
      await portfolioService.addHolding(newPortfolio.id, {
        symbol: holding.symbol,
        quantity: holding.quantity,
        average_buy_price: holding.averageBuyPrice,
      });
      const updated = await portfolioService.getPortfolios();
      setPortfolios(updated);
      setFeedbackMessage(`Added ${holding.symbol} to ${newPortfolio.name}`);
    } else {
      await portfolioService.addHolding(portfolioIdToUse, {
        symbol: holding.symbol,
        quantity: holding.quantity,
        average_buy_price: holding.averageBuyPrice,
      });
      const updated = await portfolioService.getPortfolios();
      setPortfolios(updated);
      const targetName = portfolios.find((p) => String(p.id) === String(portfolioIdToUse))?.name || "Portfolio";
      setFeedbackMessage(`Added ${holding.quantity} shares of ${holding.symbol} to ${targetName}`);
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ListFilter size={18} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Stock Screener</h1>
            <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              {stocks.length} Stocks Universe
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Multi-factor screener across technical momentum, valuation ratios, and short-horizon AI forecast signals
          </p>
        </div>

        <button
          onClick={loadStocks}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Success Notification Banner */}
      {feedbackMessage && (
        <div
          data-testid="screener-feedback-banner"
          className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 backdrop-blur-sm animate-in fade-in"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <ScreenerFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
        availableSectors={availableSectors}
        totalResultsCount={filteredStocks.length}
      />

      {/* Filtered Results Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
          <p className="mt-3 text-xs text-zinc-400 font-medium">Loading stock universe and live indicators...</p>
        </div>
      ) : (
        <ScreenerTable
          stocks={filteredStocks}
          onAddToPortfolio={handleAddToPortfolio}
          onAddToWatchlist={handleAddToWatchlist}
        />
      )}

      {/* Guest Action Interception Modal */}
      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        actionType={authPromptAction}
        stockSymbol={selectedStockSymbol}
      />

      {/* Add Holding Modal for Authenticated User */}
      <AddHoldingModal
        isOpen={isAddHoldingOpen}
        onClose={() => {
          setIsAddHoldingOpen(false);
          setTargetHoldingStock(null);
        }}
        onAddHolding={handleAddHoldingSubmit}
        initialSymbol={targetHoldingStock?.symbol}
        initialPrice={targetHoldingStock?.price}
        portfolios={portfolios}
        activePortfolioId={portfolios[0]?.id}
      />
    </div>
  );
}
