import { useState, useEffect, type FormEvent } from "react";
import { Plus, X, Check, Loader2 } from "lucide-react";
import type { Holding, PortfolioItem } from "../types/portfolio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddHolding: (holding: Holding, targetPortfolioId?: number | string) => Promise<void> | void;
  initialSymbol?: string;
  initialPrice?: number;
  portfolios?: PortfolioItem[];
  activePortfolioId?: number | string;
}

const POPULAR_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", currentPrice: 1420.50 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "Technology", currentPrice: 3842.20 },
  { symbol: "INFY", name: "Infosys Ltd.", sector: "Technology", currentPrice: 1632.40 },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Banking", currentPrice: 1946.30 },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", sector: "Banking", currentPrice: 1325.40 },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", sector: "Automobile", currentPrice: 890.50 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", currentPrice: 812.30 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", currentPrice: 1640.80 },
  { symbol: "ITC", name: "ITC Ltd.", sector: "FMCG", currentPrice: 475.20 },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Capital Goods", currentPrice: 3580.00 },
];

export default function AddHoldingModal({
  isOpen,
  onClose,
  onAddHolding,
  initialSymbol,
  initialPrice,
  portfolios = [],
  activePortfolioId,
}: Props) {
  const [symbol, setSymbol] = useState(initialSymbol || "RELIANCE");
  const [customSymbol, setCustomSymbol] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [quantity, setQuantity] = useState("10");
  const [avgPrice, setAvgPrice] = useState(initialPrice ? initialPrice.toFixed(2) : "1420.50");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | number>(
    activePortfolioId || (portfolios[0]?.id ?? "")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSymbol) {
      const match = POPULAR_STOCKS.find(
        (s) => s.symbol.toUpperCase() === initialSymbol.toUpperCase()
      );
      if (match) {
        setSymbol(match.symbol);
        setIsCustom(false);
      } else {
        setCustomSymbol(initialSymbol.toUpperCase());
        setIsCustom(true);
      }
    }
    if (initialPrice && initialPrice > 0) {
      setAvgPrice(initialPrice.toFixed(2));
    }
  }, [initialSymbol, initialPrice]);

  useEffect(() => {
    if (activePortfolioId) {
      setSelectedPortfolioId(activePortfolioId);
    } else if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].id);
    }
  }, [activePortfolioId, portfolios]);

  if (!isOpen) return null;

  const effectiveSymbol = (isCustom ? customSymbol : symbol).toUpperCase().trim();
  const parsedQty = parseFloat(quantity) || 0;
  const parsedPrice = parseFloat(avgPrice) || 0;
  const totalInvestment = parsedQty * parsedPrice;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!effectiveSymbol) {
      setError("Please specify a stock symbol.");
      return;
    }
    if (parsedQty <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }
    if (parsedPrice <= 0) {
      setError("Average buy price must be greater than zero.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const stockInfo = POPULAR_STOCKS.find((s) => s.symbol === effectiveSymbol) || {
        symbol: effectiveSymbol,
        name: `${effectiveSymbol} India`,
        sector: "Diversified",
        currentPrice: parsedPrice,
      };

      await onAddHolding(
        {
          symbol: effectiveSymbol,
          name: stockInfo.name,
          sector: stockInfo.sector,
          quantity: parsedQty,
          averageBuyPrice: parsedPrice,
          currentPrice: stockInfo.currentPrice,
        },
        selectedPortfolioId ? selectedPortfolioId : undefined
      );
      onClose();
    } catch (err: any) {
      console.error("Failed to add holding:", err);
      setError(err?.message || "Failed to add holding to portfolio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="add-holding-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        data-testid="add-holding-modal"
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight">Add Stock Holding</h3>
              <p className="text-[11px] text-zinc-400">Record an executed buy position</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Portfolio Selection if multiple portfolios exist */}
          {portfolios.length > 1 && (
            <div>
              <label className="text-xs font-semibold text-zinc-400">Target Portfolio</label>
              <select
                value={selectedPortfolioId}
                onChange={(e) => setSelectedPortfolioId(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
                data-testid="add-holding-portfolio-select"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.holdings_count} assets)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock Symbol Selection / Custom Input */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400">Stock Symbol</label>
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-[11px] font-semibold text-emerald-400 hover:underline"
              >
                {isCustom ? "Select Popular Stock" : "Enter Custom Symbol"}
              </button>
            </div>

            {isCustom ? (
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE, TCS, INFY"
                data-testid="add-holding-symbol-input"
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs uppercase text-white outline-none focus:border-emerald-500"
                required
              />
            ) : (
              <select
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  const s = POPULAR_STOCKS.find((x) => x.symbol === e.target.value);
                  if (s) setAvgPrice(s.currentPrice.toFixed(2));
                }}
                data-testid="add-holding-symbol-select"
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
              >
                {POPULAR_STOCKS.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} - {s.name} (₹{s.currentPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity & Buy Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400">Quantity (Shares)</label>
              <input
                type="number"
                min="0.0001"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                data-testid="add-holding-quantity-input"
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400">Avg Buy Price (₹)</label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                data-testid="add-holding-price-input"
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Investment Preview summary */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Total Investment Value:</span>
            <span className="font-bold text-white">
              ₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="add-holding-submit-button"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={14} /> Add Position
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
