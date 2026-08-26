import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Check, Briefcase, Trash2 } from "lucide-react";
import type { PortfolioItem } from "../types/portfolio";

interface Props {
  portfolios: PortfolioItem[];
  activePortfolio: PortfolioItem | null;
  onSelectPortfolio: (portfolio: PortfolioItem) => void;
  onOpenCreateModal: () => void;
  onDeletePortfolio?: (portfolio: PortfolioItem) => void;
}

export default function PortfolioSwitcher({
  portfolios,
  activePortfolio,
  onSelectPortfolio,
  onOpenCreateModal,
  onDeletePortfolio,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:border-zinc-700 hover:bg-zinc-800/90 transition backdrop-blur-sm"
        id="portfolio-switcher-button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
          <Briefcase size={12} />
        </div>
        <div className="flex items-center gap-2 text-left">
          <span className="font-bold text-white max-w-[140px] truncate">
            {activePortfolio ? activePortfolio.name : "Select Portfolio"}
          </span>
          {activePortfolio && (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
              {activePortfolio.holdings_count} {activePortfolio.holdings_count === 1 ? "asset" : "assets"}
            </span>
          )}
        </div>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-72 origin-top-left rounded-2xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/80">
            Your Portfolios
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {portfolios.map((p) => {
              const isSelected = activePortfolio?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-400 font-medium"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                  onClick={() => {
                    onSelectPortfolio(p);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-semibold text-white truncate">{p.name}</span>
                    {p.description && (
                      <span className="text-[11px] text-zinc-500 truncate">{p.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-md bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      {p.holdings_count}
                    </span>
                    {isSelected && <Check size={14} className="text-emerald-400" />}
                    {onDeletePortfolio && portfolios.length > 1 && !isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete portfolio "${p.name}"?`)) {
                            onDeletePortfolio(p);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition"
                        title="Delete Portfolio"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenCreateModal();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition"
              id="new-portfolio-button"
            >
              <Plus size={14} />
              <span>+ New Portfolio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
