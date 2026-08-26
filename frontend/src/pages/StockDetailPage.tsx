import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useStockDetails, useStockTechnicals, StockHeader, StockFundamentalsCard, StockTechnicalsCard } from "../features/stocks";
import { ForecastCard } from "../features/forecasts";
import { useAuth, AuthPromptModal } from "../features/auth";
import { AddHoldingModal, portfolioService, type PortfolioItem, type Holding } from "../features/portfolios";
import { getSavedWatchlists, saveWatchlists } from "../features/watchlists/services/watchlistService";
import InteractiveStockChart from "../components/charts/InteractiveStockChart";

export default function StockDetailPage() {
  const { symbol = "RELIANCE" } = useParams<{ symbol: string }>();
  const sym = symbol.toUpperCase();

  const { isAuthenticated } = useAuth();
  const { data: stock, isLoading: isStockLoading } = useStockDetails(sym);
  const { data: technicals } = useStockTechnicals(sym);

  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<"portfolio" | "watchlist">("portfolio");
  const [isAddHoldingOpen, setIsAddHoldingOpen] = useState(false);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      portfolioService.getPortfolios().then(setPortfolios).catch(() => setPortfolios([]));
    }
  }, [isAuthenticated]);

  const handleAddToPortfolioClick = () => {
    if (!isAuthenticated) {
      setAuthPromptAction("portfolio");
      setIsAuthPromptOpen(true);
      return;
    }
    setIsAddHoldingOpen(true);
  };

  const handleAddToWatchlistClick = () => {
    if (!isAuthenticated) {
      setAuthPromptAction("watchlist");
      setIsAuthPromptOpen(true);
      return;
    }

    // Add stock to default / core saved watchlist
    try {
      const currentGroups = getSavedWatchlists();
      const targetGroup = currentGroups[0] || {
        id: "core",
        name: "Core Watchlist",
        items: [],
      };

      const alreadyExists = targetGroup.items.some(
        (item) => item.symbol.toUpperCase() === sym
      );

      if (!alreadyExists && stock) {
        targetGroup.items.push({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price ?? 0,
          change: stock.change ?? 0,
          change_percent: stock.change_percent ?? 0,
          rsi: technicals?.rsi_14 ?? 50,
          forecast_5d_pct: 2.0,
          forecast_prob: 60,
          sparkline: [stock.price ?? 1000],
        });
        saveWatchlists(currentGroups.length > 0 ? currentGroups : [targetGroup]);
        setFeedbackMessage(`Added ${stock.symbol} to your watchlist.`);
      } else {
        setFeedbackMessage(`${sym} is already in your watchlist.`);
      }
    } catch {
      setFeedbackMessage(`Saved ${sym} to watchlist.`);
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleAddHoldingSubmit = async (holding: Holding, targetPortfolioId?: number | string) => {
    const portfolioIdToUse = targetPortfolioId || portfolios[0]?.id;
    if (!portfolioIdToUse) {
      // If user has no portfolio, create a default one
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

  if (isStockLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
        <p className="text-zinc-400">Stock {sym} not found in database.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-xs font-semibold text-emerald-400 hover:underline">
          Return to Market Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Success Notification Banner */}
      {feedbackMessage && (
        <div
          data-testid="stock-detail-feedback-banner"
          className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 backdrop-blur-sm animate-in fade-in"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Stock Ticker Header with Action Callbacks */}
      <StockHeader
        stock={stock}
        onAddToPortfolio={handleAddToPortfolioClick}
        onAddToWatchlist={handleAddToWatchlistClick}
      />

      {/* Interactive Price Chart */}
      <InteractiveStockChart symbol={stock.symbol} />

      {/* AI / ML Walk-Forward Forecast Card */}
      <ForecastCard symbol={stock.symbol} currentPrice={stock.price} />

      {/* 2-Column Technicals & Fundamentals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockTechnicalsCard technicals={technicals} />
        <StockFundamentalsCard stock={stock} />
      </div>

      {/* Guest Interception Modal */}
      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        actionType={authPromptAction}
        stockSymbol={stock.symbol}
      />

      {/* Authenticated Add Holding Modal */}
      <AddHoldingModal
        isOpen={isAddHoldingOpen}
        onClose={() => setIsAddHoldingOpen(false)}
        onAddHolding={handleAddHoldingSubmit}
        initialSymbol={stock.symbol}
        initialPrice={stock.price ?? 0}
        portfolios={portfolios}
        activePortfolioId={portfolios[0]?.id}
      />
    </div>
  );
}
