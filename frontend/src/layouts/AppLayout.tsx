import { Link, Outlet, useLocation } from "react-router-dom";
import DevelopmentBanner from "../components/common/DevelopmentBanner";
import {
  Bell,
  BarChart3,
  Briefcase,
  GitCompare,
  LayoutDashboard,
  ListFilter,
  Menu,
  Star,
} from "lucide-react";
import { useState } from "react";
import { StockSearchBar } from "../features/stocks";
import { AccountMenu } from "../features/auth";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Watchlist",
    icon: Star,
    path: "/watchlist",
  },
  {
    label: "Screener",
    icon: ListFilter,
    path: "/screener",
  },
  {
    label: "Compare",
    icon: GitCompare,
    path: "/compare",
  },
  {
    label: "Portfolio",
    icon: Briefcase,
    path: "/portfolio",
  },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-zinc-800/80 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/20 font-bold">
              <BarChart3 size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              TradeNet
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/dashboard" && location.pathname === "/");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                <Icon size={17} className={isActive ? "text-emerald-400" : "text-zinc-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Account Footer */}
        <div className="border-t border-zinc-800/80 p-3">
          <AccountMenu variant="sidebar" />
        </div>
      </aside>

      {/* Main Container */}
      <div className={`transition-all duration-200 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-800/80 bg-zinc-950/80 px-6 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          >
            <Menu size={18} />
          </button>

          {/* Quick Stock Search */}
          <div className="max-w-xl flex-1">
            <StockSearchBar />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="relative rounded-xl p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </button>

            <div className="hidden sm:block text-right pl-2 border-l border-zinc-800">
              <p className="text-xs font-semibold text-zinc-200">NSE / BSE</p>
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center justify-end gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Session
              </p>
            </div>

            {/* Header Account Popover */}
            <div className="pl-1 sm:pl-2 border-l border-zinc-800">
              <AccountMenu variant="header" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          <DevelopmentBanner />
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

