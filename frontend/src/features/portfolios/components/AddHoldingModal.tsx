import React, { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import type { Holding } from "../types/portfolio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddHolding: (holding: Holding) => void;
}

const POPULAR_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", currentPrice: 1420.50 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "Technology", currentPrice: 3842.20 },
  { symbol: "INFY", name: "Infosys Ltd.", sector: "Technology", currentPrice: 1632.40 },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", sector: "Banking", currentPrice: 1946.30 },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", sector: "Banking", currentPrice: 1325.40 },
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", sector: "Automobile", currentPrice: 890.50 },
];

export default function AddHoldingModal({ isOpen, onClose, onAddHolding }: Props) {
  const [symbol, setSymbol] = useState("RELIANCE");
  const [quantity, setQuantity] = useState("20");
  const [avgPrice, setAvgPrice] = useState("1380.00");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stockInfo = POPULAR_STOCKS.find((s) => s.symbol === symbol) || {
      symbol,
      name: `${symbol} India`,
      sector: "Diversified",
      currentPrice: parseFloat(avgPrice) || 1000,
    };

    onAddHolding({
      symbol,
      name: stockInfo.name,
      sector: stockInfo.sector,
      quantity: parseInt(quantity, 10) || 1,
      averageBuyPrice: parseFloat(avgPrice) || 100,
      currentPrice: stockInfo.currentPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white">Add Stock Holding</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400">Stock Symbol</label>
            <select
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
                const s = POPULAR_STOCKS.find((x) => x.symbol === e.target.value);
                if (s) setAvgPrice(s.currentPrice.toFixed(2));
              }}
              className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
            >
              {POPULAR_STOCKS.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} - {s.name} (₹{s.currentPrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400">Quantity (Shares)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400">Average Buy Price (₹)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md"
            >
              <Check size={14} /> Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
