import React, { useState } from "react";
import { Bell, X, Check } from "lucide-react";
import type { StockAlert } from "../types/watchlist";

interface Props {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveAlert: (alert: StockAlert) => void;
}

export default function CreateAlertModal({ symbol, isOpen, onClose, onSaveAlert }: Props) {
  const [condition, setCondition] = useState<StockAlert["condition"]>("PRICE_ABOVE");
  const [value, setValue] = useState("1500");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAlert({
      id: `alert_${Date.now()}`,
      symbol,
      condition,
      thresholdValue: parseFloat(value) || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-emerald-400" />
            <h3 className="font-bold text-white">Create Alert for {symbol}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400">Trigger Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="PRICE_ABOVE">Price Rises Above (₹)</option>
              <option value="PRICE_BELOW">Price Falls Below (₹)</option>
              <option value="RSI_OVERBOUGHT">RSI Rises Above 70 (Overbought)</option>
              <option value="RSI_OVERSOLD">RSI Falls Below 30 (Oversold)</option>
            </select>
          </div>

          {(condition === "PRICE_ABOVE" || condition === "PRICE_BELOW") && (
            <div>
              <label className="text-xs font-semibold text-zinc-400">Target Threshold Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          )}

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
              <Check size={14} /> Set Active Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
