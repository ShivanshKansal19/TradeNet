import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface Props {
  selectedSymbols: string[];
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
}

const AVAILABLE_STOCKS = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "TATAMOTORS", "ITC", "SBIN"];

export default function CompareStockSelector({
  selectedSymbols,
  onAddSymbol,
  onRemoveSymbol,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const remaining = AVAILABLE_STOCKS.filter((s) => !selectedSymbols.includes(s));

  return (
    <div className="flex flex-wrap items-center gap-3">
      {selectedSymbols.map((sym) => (
        <div
          key={sym}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm font-bold text-white shadow-sm"
        >
          <span>{sym}</span>
          {selectedSymbols.length > 2 && (
            <button
              onClick={() => onRemoveSymbol(sym)}
              className="text-zinc-400 hover:text-rose-400 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {selectedSymbols.length < 4 && remaining.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition"
          >
            <Plus size={14} />
            Add Stock ({selectedSymbols.length}/4)
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
              {remaining.map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    onAddSymbol(sym);
                    setDropdownOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-zinc-200 hover:bg-zinc-900 hover:text-white"
                >
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
