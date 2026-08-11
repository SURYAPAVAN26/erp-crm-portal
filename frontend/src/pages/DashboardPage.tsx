import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Package, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { apiClient } from "../api/client";
import { DashboardSummary } from "../types";
import { Card, PageHeader, Spinner } from "../components/ui";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate } from "../lib/format";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    apiClient
      .get("/dashboard/summary")
      .then((res) => setSummary(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const stats = [
    { label: "Total customers", value: summary?.totalCustomers ?? 0, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Active leads", value: summary?.activeLeads ?? 0, icon: Users, color: "text-amber-600 bg-amber-50" },
    { label: "Total products", value: summary?.totalProducts ?? 0, icon: Package, color: "text-emerald-600 bg-emerald-50" },
    { label: "Low stock alerts", value: summary?.lowStockProducts ?? 0, icon: AlertTriangle, color: "text-rose-600 bg-rose-50" },
    { label: "Draft challans", value: summary?.draftChallans ?? 0, icon: FileText, color: "text-slate-600 bg-slate-100" },
    { label: "Confirmed challans", value: summary?.confirmedChallans ?? 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div>
      <PageHeader title={`Welcome back, ${user?.name?.split(" ")[0]}`} subtitle="Here's what's happening across your operations today." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent sales challans</h2>
        <Card className="p-0">
          {summary?.recentChallans?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Challan #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentChallans.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link to={`/challans/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                        {c.challanNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {(c.customer as { name?: string })?.name ?? "-"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">No challans yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
