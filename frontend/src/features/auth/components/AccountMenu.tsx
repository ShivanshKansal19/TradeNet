import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  Briefcase,
  Star,
  LogOut,
  ChevronDown,
  LogIn,
  ShieldCheck,
} from "lucide-react";

interface AccountMenuProps {
  variant?: "header" | "sidebar";
}

export default function AccountMenu({ variant = "header" }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  if (!isAuthenticated || !user) {
    if (variant === "sidebar") {
      return (
        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition shadow-sm"
        >
          <LogIn size={15} />
          Sign In
        </Link>
      );
    }

    return (
      <Link
        to="/login"
        className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition shadow-sm"
      >
        <LogIn size={14} />
        Sign In
      </Link>
    );
  }

  const initials = user.username.slice(0, 2).toUpperCase();
  const displayName =
    user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : user.username;

  return (
    <div className="relative" ref={menuRef}>
      {variant === "sidebar" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="User account menu"
          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 hover:bg-zinc-900 transition group focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold shadow-sm">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-zinc-200 group-hover:text-white transition">
              {displayName}
            </p>
            <p className="truncate text-[10px] text-zinc-500">
              {user.email || `@${user.username}`}
            </p>
          </div>
          <ChevronDown
            size={14}
            className={`text-zinc-500 group-hover:text-emerald-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-emerald-400" : ""
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="User account menu"
          className="flex items-center gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-2.5 py-1.5 hover:border-emerald-500/40 hover:bg-zinc-900 transition group focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold shadow-sm">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          </div>
          <span className="hidden md:inline-block text-xs font-semibold text-zinc-200 group-hover:text-white max-w-[120px] truncate">
            {user.username}
          </span>
          <ChevronDown
            size={14}
            className={`text-zinc-500 group-hover:text-emerald-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-emerald-400" : ""
            }`}
          />
        </button>
      )}

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-64 rounded-2xl border border-zinc-800/90 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            variant === "sidebar"
              ? "bottom-full left-0 mb-2 mt-0"
              : "right-0"
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header */}
          <div className="border-b border-zinc-800/80 px-3 py-2.5 mb-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-bold text-white">{displayName}</p>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={10} />
                Active
              </span>
            </div>
            <p className="truncate text-[11px] text-zinc-400 mt-0.5">
              {user.email || `@${user.username}`}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-0.5">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900/80 hover:text-white transition group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition">
                <UserIcon size={13} />
              </div>
              <span>My Profile</span>
            </Link>

            <Link
              to="/portfolio"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900/80 hover:text-white transition group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition">
                <Briefcase size={13} />
              </div>
              <span>Portfolios</span>
            </Link>

            <Link
              to="/watchlist"
              onClick={() => setIsOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900/80 hover:text-white transition group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition">
                <Star size={13} />
              </div>
              <span>Watchlists</span>
            </Link>
          </div>

          {/* Divider & Logout */}
          <div className="border-t border-zinc-800/80 mt-1 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition">
                <LogOut size={13} />
              </div>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
