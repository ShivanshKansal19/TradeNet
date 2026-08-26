import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Search, Loader2 } from "lucide-react";
import { searchStocks, type StockSearchResult } from "../../stocks/services/stockService";

interface Props {
  selectedSymbols: string[];
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
}

const QUICK_PICKS = [
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS",
  "MARUTI", "SBIN", "ZOMATO", "TATAPOWER", "ITC", "TITAN", "SUZLON"
];

export default function CompareStockSelector({
  selectedSymbols,
  onAddSymbol,
  onRemoveSymbol,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus input on open
  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [dropdownOpen]);

  // Handle live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    const timer = setTimeout(() => {
      searchStocks(query)
        .then((res) => {
          if (isMounted) {
            setResults(res);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (symbol: string) => {
    onAddSymbol(symbol);
    setDropdownOpen(false);
  };

  const filteredQuickPicks = QUICK_PICKS.filter((s) => !selectedSymbols.includes(s));

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Selected Stock Badges */}
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
              title={`Remove ${sym}`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {/* Add Stock Button with Live Search Popover */}
      {selectedSymbols.length < 4 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition"
          >
            <Plus size={14} />
            Add Stock ({selectedSymbols.length}/4)
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 sm:left-0 top-full z-40 mt-2 w-72 sm:w-80 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl backdrop-blur-xl">
              {/* Search Bar Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search any NSE/BSE stock..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-8 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Search Results / Suggestions */}
              <div className="mt-2.5 max-h-56 overflow-y-auto space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6 text-xs text-zinc-500 gap-2">
                    <Loader2 size={14} className="animate-spin text-emerald-400" />
                    Searching Indian market...
                  </div>
                ) : query.trim() ? (
                  results.length > 0 ? (
                    results
                      .filter((r) => !selectedSymbols.includes(r.symbol))
                      .map((item) => (
                        <button
                          key={item.symbol}
                          onClick={() => handleSelect(item.symbol)}
                          className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-zinc-900 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-white">{item.symbol}</span>
                              <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">{item.name}</span>
                            </div>
                            {item.sector && <span className="text-[10px] text-zinc-500">{item.sector}</span>}
                          </div>
                          {item.price > 0 && (
                            <span className="text-xs font-semibold text-zinc-200">
                              ₹{item.price.toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))
                  ) : (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      No matching stocks for "{query}"
                    </div>
                  )
                ) : (
                  <div>
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Quick Suggestions
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 p-1">
                      {filteredQuickPicks.slice(0, 9).map((sym) => (
                        <button
                          key={sym}
                          onClick={() => handleSelect(sym)}
                          className="rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 py-1.5 text-center text-xs font-bold text-zinc-300 hover:text-white transition"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
