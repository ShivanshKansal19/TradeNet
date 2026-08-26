import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth";
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShieldCheck,
  Briefcase,
  Star,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  Loader2,
  RotateCcw,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleReset = () => {
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setEmail(user.email || "");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const hasChanges =
    firstName !== (user.first_name || "") ||
    lastName !== (user.last_name || "") ||
    email !== (user.email || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[] | string> } };
      if (error.response?.data) {
        const errorData = error.response.data;
        const firstKey = Object.keys(errorData)[0];
        const val = errorData[firstKey];
        setErrorMessage(
          Array.isArray(val) ? `${firstKey}: ${val[0]}` : typeof val === "string" ? val : "Failed to update profile."
        );
      } else {
        setErrorMessage("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const displayName =
    user.first_name || user.last_name
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
      : user.username;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-extrabold text-2xl shadow-lg shadow-emerald-500/20">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={12} />
                  Verified Trader
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                <span className="text-zinc-500 font-mono">@{user.username}</span>
                <span className="text-zinc-600">•</span>
                <Mail size={13} className="text-zinc-500" />
                {user.email || "No email linked"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition shadow-sm"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Notifications / Feedback Toasts */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 shadow-lg animate-in fade-in slide-in-from-top-2"
        >
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400 shadow-lg animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Details & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Profile Form */}
        <div className="lg:col-span-2 space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 backdrop-blur-md">
          <div>
            <h2 className="text-base font-bold text-white">Profile Settings</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Update your personal details and public trader profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@example.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 pl-9 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Mail
                  size={14}
                  className="absolute left-3 top-3 text-zinc-500 pointer-events-none"
                />
              </div>
            </div>

            {/* Read-Only Username Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Username
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                  <Lock size={10} />
                  Immutable
                </span>
              </div>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full rounded-xl border border-zinc-800/60 bg-zinc-950/30 pl-9 pr-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed select-none"
                />
                <UserIcon
                  size={14}
                  className="absolute left-3 top-3 text-zinc-600 pointer-events-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <RotateCcw size={13} />
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg ${
                  hasChanges && !isSaving
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 hover:brightness-110 shadow-emerald-500/20"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Metadata & Quick Access */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Account Overview
            </h2>

            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-medium mb-0.5">
                  <Calendar size={13} className="text-emerald-400" />
                  Member Since
                </div>
                <p className="text-xs font-semibold text-white">{formattedDate}</p>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3">
                <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-medium mb-0.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Account Security
                </div>
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  JWT Session Active
                </p>
              </div>
            </div>
          </div>

          {/* Workspaces Card */}
          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Quick Navigation
            </h2>

            <div className="space-y-2">
              <Link
                to="/portfolio"
                className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 text-xs font-semibold text-zinc-200 hover:border-emerald-500/40 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                    <Briefcase size={14} />
                  </div>
                  <span>My Portfolios</span>
                </div>
                <span className="text-zinc-500 group-hover:text-emerald-400 transition">→</span>
              </Link>

              <Link
                to="/watchlist"
                className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3 text-xs font-semibold text-zinc-200 hover:border-emerald-500/40 hover:text-white transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                    <Star size={14} />
                  </div>
                  <span>My Watchlists</span>
                </div>
                <span className="text-zinc-500 group-hover:text-amber-400 transition">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
