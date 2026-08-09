import { Link, Outlet } from "react-router-dom";
import {
  Bell,
  BarChart3,
  Briefcase,
  ChevronDown,
  GitCompare,
  LayoutDashboard,
  ListFilter,
  Menu,
  Search,
  Star,
} from "lucide-react";
import { useState } from "react";

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-zinc-800 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
              <BarChart3 size={18} />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              TradeNet
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-zinc-800 p-3">
          <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-zinc-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm">
              S
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">User</p>
              <p className="truncate text-xs text-zinc-500">Free account</p>
            </div>

            <ChevronDown size={16} className="text-zinc-500" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`transition-all duration-200 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-800 bg-zinc-950/90 px-6 backdrop-blur">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative max-w-xl flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              placeholder="Search stocks, ETFs..."
              className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-600"
            />
          </div>

          <button className="relative rounded-lg p-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">Market</p>
            <p className="text-xs text-emerald-500">● Open</p>
          </div>
        </header>

        {/* Page */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
