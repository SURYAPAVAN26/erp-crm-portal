import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { loginRequest } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../api/client";
import { Button, Input } from "../components/ui";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@erp.com" },
  { role: "Sales", email: "sales@erp.com" },
  { role: "Warehouse", email: "warehouse@erp.com" },
  { role: "Accounts", email: "accounts@erp.com" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("admin@erp.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Building2 size={22} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Wholesale ERP + CRM</h1>
          <p className="text-sm text-slate-500">Operations portal sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        <div className="mt-5 rounded-xl bg-slate-100 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Demo credentials</p>
          <ul className="space-y-1 text-xs text-slate-600">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.email} className="flex justify-between">
                <span>{a.role}</span>
                <span className="font-mono">{a.email}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-400">Password for all: Passw0rd!</p>
        </div>
      </div>
    </div>
  );
}
