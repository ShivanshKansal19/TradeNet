import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, TrendingDown, X } from "lucide-react";
import { useStockSearch } from "../hooks/useStockSearch";

interface Props {
  placeholder?: string;
  className?: string;
}

export default function StockSearchBar({
  placeholder = "Search Indian stocks (e.g. RELIANCE, TCS, INFY)...",
  className = "",
}: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: results = [], isLoading } = useStockSearch(query);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/stocks/${symbol}`);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-10 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-md">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-zinc-500">Searching market stocks...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="flex w-full items-center justify-between rounded-lg p-2.5 text-left hover:bg-zinc-900 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.symbol}</span>
                      <span className="text-xs text-zinc-400 truncate max-w-[200px]">{item.name}</span>
                    </div>
                    {item.sector && <span className="text-[11px] text-zinc-500">{item.sector}</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">₹{item.price.toFixed(2)}</span>
                    <p
                      className={`text-xs font-semibold ${
                        item.change_percent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {item.change_percent >= 0 ? "+" : ""}
                      {item.change_percent.toFixed(2)}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-500">No stocks matching "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
