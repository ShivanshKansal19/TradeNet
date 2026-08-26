import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, User as UserIcon, Mail, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/portfolio";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !passwordConfirm.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirm: passwordConfirm,
      });
      navigate(next);
    } catch (err: any) {
      const fieldErrors = err?.response?.data;
      if (fieldErrors && typeof fieldErrors === "object") {
        const firstKey = Object.keys(fieldErrors)[0];
        const val = fieldErrors[firstKey];
        const msg = Array.isArray(val) ? val[0] : String(val);
        setError(`${firstKey.replace("_", " ")}: ${msg}`);
      } else {
        setError("Registration failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 mb-3">
          <Sparkles size={12} /> Auto-provisions &quot;My Portfolio&quot;
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
        <p className="mt-1.5 text-xs text-zinc-400">
          Join TradeNet to track your Indian market portfolios and watchlists
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              First Name
            </label>
            <input
              type="text"
              id="register-firstname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Rahul"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              id="register-lastname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Sharma"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Username <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <UserIcon size={16} />
            </div>
            <input
              type="text"
              id="register-username"
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
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <Mail size={16} />
            </div>
            <input
              type="email"
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="register-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Confirm Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="register-password-confirm"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
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
              Create Account
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-400">
        Already have an account?{" "}
        <Link
          to={`/login${next !== "/portfolio" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
