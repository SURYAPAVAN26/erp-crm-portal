import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { cancelChallan, confirmChallan, getChallan } from "../../api/challans";
import { Challan } from "../../types";
import { Button, Card, PageHeader, Spinner } from "../../components/ui";
import { StatusBadge } from "../../components/StatusBadge";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../api/client";
import { useAuthStore } from "../../store/authStore";

export default function ChallanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  function load() {
    if (!id) return;
    getChallan(id).then(setChallan).finally(() => setLoading(false));
  }
  useEffect(load, [id]);

  async function handleConfirm() {
    if (!id) return;
    setActing(true);
    setError("");
    try {
      await confirmChallan(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    if (!window.confirm("Cancel this challan? If confirmed, stock will be restored.")) return;
    setActing(true);
    setError("");
    try {
      await cancelChallan(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!challan) return <p className="text-sm text-slate-500">Challan not found.</p>;

  const canAct = (user?.role === "ADMIN" || user?.role === "SALES") && challan.status === "DRAFT";
  const canCancelConfirmed = user?.role === "ADMIN" && challan.status === "CONFIRMED";
  const customer = challan.customer as { id?: string; name?: string; businessName?: string | null };
  const total = challan.items.reduce((sum, i) => sum + Number(i.unitPriceSnapshot) * i.quantity, 0);

  return (
    <div>
      <PageHeader
        title={challan.challanNumber}
        subtitle={`Created ${formatDateTime(challan.createdAt)} by ${challan.createdBy?.name ?? "-"}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={challan.status} />
            {canAct && (
              <Button onClick={handleConfirm} disabled={acting}>
                <CheckCircle2 size={14} /> Confirm & deduct stock
              </Button>
            )}
            {(canAct || canCancelConfirmed) && (
              <Button variant="danger" onClick={handleCancel} disabled={acting}>
                <XCircle size={14} /> Cancel
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Unit price</th>
                  <th className="px-5 py-3 font-medium">Line total</th>
                </tr>
              </thead>
              <tbody>
                {challan.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-700">{item.productNameSnapshot}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.productSkuSnapshot}</td>
                    <td className="px-5 py-3 text-slate-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-slate-600">{formatCurrency(item.unitPriceSnapshot)}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {formatCurrency(Number(item.unitPriceSnapshot) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-right text-sm font-medium text-slate-500">
                    Total
                  </td>
                  <td className="px-5 py-3 text-base font-semibold text-slate-900">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Customer</h2>
            {customer?.id ? (
              <Link to={`/customers/${customer.id}`} className="font-medium text-indigo-600 hover:underline">
                {customer.name}
              </Link>
            ) : (
              <p className="text-slate-700">{customer?.name}</p>
            )}
            {customer?.businessName && <p className="text-sm text-slate-500">{customer.businessName}</p>}
          </Card>

          <Card>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total quantity</dt>
                <dd className="font-medium text-slate-700">{challan.totalQuantity}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Line items</dt>
                <dd className="font-medium text-slate-700">{challan.items.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <StatusBadge status={challan.status} />
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
