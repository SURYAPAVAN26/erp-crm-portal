import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { addFollowUp, getCustomer } from "../../api/customers";
import { Customer } from "../../types";
import { Button, Card, PageHeader, Spinner, Textarea } from "../../components/ui";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../api/client";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!id) return;
    getCustomer(id).then(setCustomer).finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!id || !note.trim()) return;
    setSaving(true);
    setError("");
    try {
      await addFollowUp(id, note.trim());
      setNote("");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!customer) return <p className="text-sm text-slate-500">Customer not found.</p>;

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle={customer.businessName ?? undefined}
        actions={
          <Link to={`/customers/${customer.id}/edit`}>
            <Button variant="secondary">
              <Pencil size={14} /> Edit
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Contact & business details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Detail label="Mobile" value={customer.mobile} />
              <Detail label="Email" value={customer.email || "-"} />
              <Detail label="Customer type" value={customer.customerType} />
              <Detail label="GST number" value={customer.gstNumber || "-"} />
              <Detail label="Address" value={customer.address || "-"} />
              <Detail label="Follow-up date" value={formatDate(customer.followUpDate)} />
            </dl>
            {customer.notes && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs font-medium uppercase text-slate-400">Notes</p>
                <p className="mt-1 text-sm text-slate-600">{customer.notes}</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Sales challans</h2>
            {customer.challans && customer.challans.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {customer.challans.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2.5">
                    <Link to={`/challans/${c.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                      {c.challanNumber}
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No challans yet for this customer.</p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Status</h2>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-xs text-slate-400">Customer since {formatDate(customer.createdAt)}</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Add follow-up note</h2>
            <form onSubmit={handleAddNote} className="space-y-2">
              <Textarea
                rows={3}
                placeholder="e.g. Called customer, will confirm order by Friday..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              {error && <p className="text-xs text-rose-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={saving || !note.trim()}>
                <Plus size={14} /> Add note
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Follow-up history</h2>
            {customer.followUps && customer.followUps.length > 0 ? (
              <ul className="space-y-3">
                {customer.followUps.map((f) => (
                  <li key={f.id} className="border-l-2 border-indigo-200 pl-3">
                    <p className="text-sm text-slate-700">{f.note}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatDateTime(f.date)} {f.createdBy && `· ${f.createdBy.name}`}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No follow-ups recorded yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{value}</dd>
    </div>
  );
}
