import React, { useState } from "react";
import { Plus, X, Loader2, FolderPlus } from "lucide-react";
import type { CreatePortfolioInput } from "../types/portfolio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreatePortfolio: (data: CreatePortfolioInput) => Promise<void>;
}

export default function CreatePortfolioModal({
  isOpen,
  onClose,
  onCreatePortfolio,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Portfolio name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreatePortfolio({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || "Failed to create portfolio.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <FolderPlus size={16} />
            </div>
            <h3 className="font-bold text-white">Create New Portfolio</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300">
              Portfolio Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Long-Term Compounders"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition"
              required
              autoFocus
              id="portfolio-name-input"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300">
              Description <span className="text-zinc-500 font-normal">(Optional)</span>
            </label>
            <textarea
              placeholder="e.g. High conviction large-cap growth stocks with 5-year horizon"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition resize-none"
              id="portfolio-description-input"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-md transition disabled:opacity-50"
              id="create-portfolio-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus size={14} /> Create Portfolio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
