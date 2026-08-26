import { Link, useLocation } from "react-router-dom";
import { Lock, LogIn, UserPlus, X, Briefcase, Bookmark } from "lucide-react";

export interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType?: "portfolio" | "watchlist" | "generic";
  stockSymbol?: string;
  redirectUrl?: string;
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  actionType = "generic",
  stockSymbol,
  redirectUrl,
}: AuthPromptModalProps) {
  const location = useLocation();

  if (!isOpen) return null;

  const returnPath = redirectUrl || (location.pathname + location.search) || "/";
  const encodedRedirect = encodeURIComponent(returnPath);

  const getActionDetails = () => {
    switch (actionType) {
      case "portfolio":
        return {
          icon: <Briefcase size={22} className="text-emerald-400" />,
          title: "Sign In to Manage Portfolios",
          description: stockSymbol
            ? `Sign in or create a free TradeNet account to add ${stockSymbol} to your portfolio, track weighted average returns, and analyze sector exposure.`
            : "Sign in or create a free TradeNet account to build portfolios and track live equity returns.",
        };
      case "watchlist":
        return {
          icon: <Bookmark size={22} className="text-indigo-400" />,
          title: "Sign In to Save Watchlist",
          description: stockSymbol
            ? `Sign in or create a free TradeNet account to save ${stockSymbol} to your personal watchlist with custom price and forecast alerts.`
            : "Sign in or create a free TradeNet account to save stocks to your personal watchlist.",
        };
      default:
        return {
          icon: <Lock size={22} className="text-emerald-400" />,
          title: "Authentication Required",
          description: "Sign in or create a free TradeNet account to access personalized equity tracking features.",
        };
    }
  };

  const details = getActionDetails();

  return (
    <div
      data-testid="auth-prompt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        data-testid="auth-prompt-modal"
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-7 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          data-testid="auth-prompt-close-button"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner">
            {details.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{details.title}</h3>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">TradeNet Member Feature</span>
          </div>
        </div>

        {/* Modal Body */}
        <p className="text-xs leading-relaxed text-zinc-400 mb-6">
          {details.description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/login?redirect=${encodedRedirect}&next=${encodedRedirect}`}
            data-testid="auth-prompt-login-link"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-xs font-semibold shadow-lg shadow-emerald-950/40 transition"
          >
            <LogIn size={15} /> Log In to Existing Account
          </Link>

          <Link
            to={`/register?redirect=${encodedRedirect}&next=${encodedRedirect}`}
            data-testid="auth-prompt-register-link"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 py-3 text-xs font-semibold transition"
          >
            <UserPlus size={15} /> Create Free Account
          </Link>

          <button
            type="button"
            onClick={onClose}
            data-testid="auth-prompt-cancel-button"
            className="w-full text-center py-2 text-[11px] font-medium text-zinc-500 hover:text-zinc-400 transition"
          >
            Continue browsing as guest
          </button>
        </div>
      </div>
    </div>
  );
}
