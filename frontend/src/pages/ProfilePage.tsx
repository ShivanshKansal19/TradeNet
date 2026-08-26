import { Link } from "react-router-dom";
import { useAuth } from "../features/auth";
import { User, Mail, Calendar, ShieldCheck, Briefcase, Star, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const formattedDate = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Active Member";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-extrabold text-2xl shadow-lg shadow-emerald-500/20">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {user.username}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={12} />
                  Verified Trader
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-500" />
                {user.email || "No email linked"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition shadow-sm"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Details & Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Details Card */}
        <div className="md:col-span-2 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                <User size={14} className="text-emerald-400" />
                Username
              </div>
              <p className="text-sm font-semibold text-white">{user.username}</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                <Mail size={14} className="text-emerald-400" />
                Email Address
              </div>
              <p className="text-sm font-semibold text-white">{user.email || "N/A"}</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                <Calendar size={14} className="text-emerald-400" />
                Member Since
              </div>
              <p className="text-sm font-semibold text-white">{formattedDate}</p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                Session Status
              </div>
              <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Authenticated & Active
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Workspaces
          </h2>

          <div className="space-y-2.5">
            <Link
              to="/portfolio"
              className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 text-xs font-semibold text-zinc-200 hover:border-emerald-500/40 hover:text-white transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                  <Briefcase size={15} />
                </div>
                <span>Main Portfolio</span>
              </div>
              <span className="text-zinc-500 group-hover:text-emerald-400 transition">→</span>
            </Link>

            <Link
              to="/watchlist"
              className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 text-xs font-semibold text-zinc-200 hover:border-emerald-500/40 hover:text-white transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                  <Star size={15} />
                </div>
                <span>My Watchlists</span>
              </div>
              <span className="text-zinc-500 group-hover:text-amber-400 transition">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
