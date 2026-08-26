import { useState, useEffect } from "react";
import { Star, Bell, Trash2 } from "lucide-react";
import {
  WatchlistManager,
  CreateAlertModal,
  getSavedWatchlists,
  saveWatchlists,
  getSavedAlerts,
  saveAlerts,
  type WatchlistGroup,
  type StockAlert,
} from "../features/watchlists";

export default function WatchlistPage() {
  const [groups, setGroups] = useState<WatchlistGroup[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [modalSymbol, setModalSymbol] = useState<string | null>(null);

  useEffect(() => {
    setGroups(getSavedWatchlists());
    setAlerts(getSavedAlerts());
  }, []);

  const handleUpdateGroups = (updated: WatchlistGroup[]) => {
    setGroups(updated);
    saveWatchlists(updated);
  };

  const handleSaveAlert = (newAlert: StockAlert) => {
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    saveAlerts(updated);
  };

  const handleRemoveAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star size={18} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Watchlists & Smart Alerts</h1>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Track saved stocks, monitor real-time prices, and receive triggers on price milestones and RSI shifts
        </p>
      </div>

      {/* Main Watchlist Manager */}
      <WatchlistManager
        groups={groups}
        onUpdateGroups={handleUpdateGroups}
        onOpenAlertModal={(sym) => setModalSymbol(sym)}
      />

      {/* Active Alerts Panel */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
          <Bell size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">Active Trigger Alerts ({alerts.length})</h3>
        </div>

        {alerts.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-500">
            No active alerts configured. Click the bell icon on any watchlist item to set an alert.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{a.symbol}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {a.condition === "PRICE_ABOVE" && `Price > ₹${a.thresholdValue}`}
                    {a.condition === "PRICE_BELOW" && `Price < ₹${a.thresholdValue}`}
                    {a.condition === "RSI_OVERBOUGHT" && "RSI > 70 (Overbought)"}
                    {a.condition === "RSI_OVERSOLD" && "RSI < 30 (Oversold)"}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveAlert(a.id)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Configuration Modal */}
      {modalSymbol && (
        <CreateAlertModal
          symbol={modalSymbol}
          isOpen={!!modalSymbol}
          onClose={() => setModalSymbol(null)}
          onSaveAlert={handleSaveAlert}
        />
      )}
    </div>
  );
}
