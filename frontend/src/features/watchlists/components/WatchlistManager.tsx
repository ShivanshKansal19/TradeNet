import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Trash2, Sparkles, FolderPlus } from "lucide-react";
import type { WatchlistGroup } from "../types/watchlist";

interface Props {
  groups: WatchlistGroup[];
  onUpdateGroups: (groups: WatchlistGroup[]) => void;
  onOpenAlertModal: (symbol: string) => void;
}

export default function WatchlistManager({ groups, onUpdateGroups, onOpenAlertModal }: Props) {
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id || "core");
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);

  const currentGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: WatchlistGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      items: [],
    };
    const updated = [...groups, newGroup];
    onUpdateGroups(updated);
    setActiveGroupId(newGroup.id);
    setNewGroupName("");
    setShowAddGroup(false);
  };

  const handleRemoveItem = (symbol: string) => {
    if (!currentGroup) return;
    const updatedItems = currentGroup.items.filter((i) => i.symbol !== symbol);
    const updated = groups.map((g) => (g.id === currentGroup.id ? { ...g, items: updatedItems } : g));
    onUpdateGroups(updated);
  };

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeGroupId === g.id
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {g.name} ({g.items.length})
            </button>
          ))}

          <button
            onClick={() => setShowAddGroup(true)}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-400 transition ml-2"
          >
            <FolderPlus size={14} /> New List
          </button>
        </div>
      </div>

      {/* New Group Inline Input */}
      {showAddGroup && (
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 max-w-md">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g. Dividend Stars, Banking..."
            className="h-8 flex-1 rounded-lg bg-zinc-950 px-3 text-xs text-white outline-none focus:border-emerald-500 border border-zinc-800"
          />
          <button
            onClick={handleCreateGroup}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            Create
          </button>
          <button
            onClick={() => setShowAddGroup(false)}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Watchlist Items Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
        {currentGroup?.items.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            This watchlist is empty. Search stocks above to add them to {currentGroup.name}.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="pb-3">Stock</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Today %</th>
                <th className="pb-3">RSI</th>
                <th className="pb-3 text-indigo-400">
                  <div className="flex items-center gap-1"><Sparkles size={12} /> 5D AI Forecast</div>
                </th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {currentGroup?.items.map((item) => {
                const isPositive = item.change >= 0;
                const isBullish = item.forecast_5d_pct >= 0;

                return (
                  <tr key={item.symbol} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3.5">
                      <Link to={`/stocks/${item.symbol}`} className="font-bold text-white hover:text-emerald-400 transition">
                        {item.symbol}
                      </Link>
                      <div className="text-[11px] text-zinc-500">{item.name}</div>
                    </td>

                    <td className="py-3.5 font-bold text-white text-sm">₹{item.price.toFixed(2)}</td>

                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center font-bold ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}{item.change_percent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          item.rsi > 65
                            ? "bg-rose-500/10 text-rose-400"
                            : item.rsi < 35
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {item.rsi.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span className={`font-bold ${isBullish ? "text-emerald-400" : "text-rose-400"}`}>
                        {isBullish ? "+" : ""}{item.forecast_5d_pct.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium ml-1">({item.forecast_prob}%)</span>
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenAlertModal(item.symbol)}
                        className="rounded-lg bg-zinc-800 hover:bg-zinc-700 p-1.5 text-zinc-300 transition"
                        title="Set Alert"
                      >
                        <Bell size={13} />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.symbol)}
                        className="rounded-lg bg-zinc-800 hover:bg-rose-500/20 p-1.5 text-zinc-400 hover:text-rose-400 transition"
                        title="Remove from Watchlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
