import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Lock, LogIn, UserPlus, Shield, Key, Zap, CheckCircle2 } from "lucide-react";
import { loginRequest } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../api/client";

const PRE_SEEDED_ACCOUNTS = [
  { role: "Admin", email: "admin@erp.com", icon: Shield, color: "text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20" },
  { role: "Sales", email: "sales@erp.com", icon: Key, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20" },
  { role: "Warehouse", email: "warehouse@erp.com", icon: Key, color: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20" },
  { role: "Accounts", email: "accounts@erp.com", icon: Key, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20" },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("admin@erp.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [selectedRole, setSelectedRole] = useState<string>("Admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  function handleSelectAccount(role: string, accountEmail: string) {
    setSelectedRole(role);
    setEmail(accountEmail);
    setPassword("Passw0rd!");
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await loginRequest(email, password);
      login(user, token);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4 py-8 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Top Logo Badge */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/20">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Operations Portal</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your ERP & CRM tasks</p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
          {/* Tab Switcher */}
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950/60 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("signin")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                activeTab === "signin"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                activeTab === "register"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Register
            </button>
          </div>

          {activeTab === "register" ? (
            <div className="my-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-center">
              <UserPlus className="mx-auto mb-2 h-8 w-8 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Admin-Managed Registration</h3>
              <p className="mt-1 text-xs text-slate-300">
                Public registration is restricted. New user accounts are created directly by system Administrators inside the portal.
              </p>
              <p className="mt-3 text-xs text-indigo-300">
                Try logging in with the pre-seeded <strong className="text-white">Admin</strong> role below!
              </p>
              <button
                type="button"
                onClick={() => {
                  handleSelectAccount("Admin", "admin@erp.com");
                  setActiveTab("signin");
                }}
                className="mt-4 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition"
              >
                Switch to Sign In as Admin
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Username / Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSelectedRole("");
                    }}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-xs text-slate-400 hover:text-indigo-400 transition"
                >
                  Don't have an account? <span className="text-indigo-400 underline underline-offset-4">Register here</span>
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Quick Test Pre-seeded Accounts
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Quick Test Accounts Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {PRE_SEEDED_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isSelected = selectedRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => {
                    handleSelectAccount(acc.role, acc.email);
                    setActiveTab("signin");
                  }}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium transition-all ${acc.color} ${
                    isSelected ? "ring-2 ring-indigo-500 shadow-md" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{acc.role}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
