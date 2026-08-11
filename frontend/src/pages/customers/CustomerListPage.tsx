import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { listCustomers } from "../../api/customers";
import { Customer } from "../../types";
import { Button, Card, EmptyState, Input, PageHeader, Select, Spinner } from "../../components/ui";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate } from "../../lib/format";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listCustomers({ search: search || undefined, status: status || undefined })
        .then((res) => setCustomers(res.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status]);

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage leads, active accounts, and follow-ups"
        actions={
          <Link to="/customers/new">
            <Button>
              <Plus size={16} /> Add customer
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search name, mobile, email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers found" description="Try adjusting filters or add a new customer." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/customers/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.businessName || "-"}</td>
                  <td className="px-5 py-3 text-slate-600">{c.mobile}</td>
                  <td className="px-5 py-3 text-slate-600">{c.customerType}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(c.followUpDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
