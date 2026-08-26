import RegisterForm from "../features/auth/components/RegisterForm";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/20 font-bold">
            <BarChart3 size={22} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            TradeNet
          </span>
        </Link>
        <p className="mt-2 text-xs text-zinc-400">
          Indian Equities Intelligence & Portfolio Management
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
