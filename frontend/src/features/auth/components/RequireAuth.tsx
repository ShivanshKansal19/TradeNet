import { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
  children?: ReactNode;
}


export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        data-testid="require-auth-loading"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 shadow-xl">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
        </div>
        <p className="text-xs font-semibold text-zinc-400">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const nextPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${nextPath}`} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
