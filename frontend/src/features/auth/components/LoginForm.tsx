import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, User as UserIcon, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/portfolio";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      navigate(next);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Invalid username or password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const reason = searchParams.get("reason");

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1.5 text-xs text-zinc-400">
          Sign in to access your portfolios, holdings, and watchlists
        </p>
      </div>

      {reason === "expired" && !error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
          <span className="font-semibold">Session expired:</span> Please sign in again to continue.
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Username
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <UserIcon size={16} />
            </div>
            <input
              type="text"
              id="login-username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. rahul_trader"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="login-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-2.5 pl-10 pr-10 text-xs text-white placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          to={`/register${next !== "/portfolio" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
