import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { listChallans } from "../../api/challans";
import { Challan } from "../../types";
import { Button, Card, EmptyState, Input, PageHeader, Select, Spinner } from "../../components/ui";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";

export default function ChallanListPage() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const user = useAuthStore((s) => s.user);
  const canCreate = user?.role === "ADMIN" || user?.role === "SALES";

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listChallans({ search: search || undefined, status: status || undefined })
        .then((res) => setChallans(res.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status]);

  return (
    <div>
      <PageHeader
        title="Sales Challans"
        subtitle="Create and track outgoing sales challans"
        actions={
          canCreate ? (
            <Link to="/challans/new">
              <Button>
                <Plus size={16} /> New challan
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search challan number..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : challans.length === 0 ? (
          <EmptyState title="No challans found" description="Try adjusting filters or create a new challan." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-3 font-medium">Challan #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total qty</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/challans/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                      {c.challanNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{(c.customer as { name?: string })?.name ?? "-"}</td>
                  <td className="px-5 py-3 text-slate-600">{c._count?.items ?? "-"}</td>
                  <td className="px-5 py-3 text-slate-600">{c.totalQuantity}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
