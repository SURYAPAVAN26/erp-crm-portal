import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { getProduct, recordStockMovement } from "../../api/products";
import { Product } from "../../types";
import { Button, Card, Field, Input, PageHeader, Spinner } from "../../components/ui";
import { StatusBadge } from "../../components/StatusBadge";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { getErrorMessage } from "../../api/client";
import { useAuthStore } from "../../store/authStore";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  function load() {
    if (!id) return;
    getProduct(id).then(setProduct).finally(() => setLoading(false));
  }
  useEffect(load, [id]);

  async function handleMovement(e: FormEvent) {
    e.preventDefault();
    if (!id || !quantity || !reason.trim()) return;
    setSaving(true);
    setError("");
    try {
      await recordStockMovement(id, { quantity: parseInt(quantity, 10), type: movementType, reason: reason.trim() });
      setQuantity("");
      setReason("");
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
  if (!product) return <p className="text-sm text-slate-500">Product not found.</p>;

  const low = product.currentStock <= product.minStockAlert;

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku}`}
        actions={
          <Link to={`/products/${product.id}/edit`}>
            <Button variant="secondary">
              <Pencil size={14} /> Edit
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Product details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Detail label="Category" value={product.category || "-"} />
              <Detail label="Unit price" value={formatCurrency(product.unitPrice)} />
              <Detail label="Location" value={product.location || "-"} />
              <Detail label="Min stock alert" value={String(product.minStockAlert)} />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Stock movement history</h2>
            {product.movements && product.movements.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Qty</th>
                    <th className="py-2 font-medium">Reason</th>
                    <th className="py-2 font-medium">By</th>
                    <th className="py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {product.movements.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2">
                        <StatusBadge status={m.type} />
                      </td>
                      <td className="py-2 font-medium text-slate-700">{m.quantity}</td>
                      <td className="py-2 text-slate-600">{m.reason}</td>
                      <td className="py-2 text-slate-500">{m.createdBy?.name ?? "-"}</td>
                      <td className="py-2 text-slate-400">{formatDateTime(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-400">No stock movements recorded yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-xs font-medium uppercase text-slate-400">Current stock</p>
            <p className={`mt-1 text-3xl font-semibold ${low ? "text-rose-600" : "text-slate-900"}`}>
              {product.currentStock}
            </p>
            {low && <p className="mt-1 text-xs text-rose-500">Below minimum alert level ({product.minStockAlert})</p>}
          </Card>

          {canManage && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Record stock movement</h2>
              <form onSubmit={handleMovement} className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType("IN")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium ring-1 ring-inset ${
                      movementType === "IN" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "text-slate-500 ring-slate-300"
                    }`}
                  >
                    <ArrowDownCircle size={14} /> Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType("OUT")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium ring-1 ring-inset ${
                      movementType === "OUT" ? "bg-rose-50 text-rose-700 ring-rose-200" : "text-slate-500 ring-slate-300"
                    }`}
                  >
                    <ArrowUpCircle size={14} /> Stock Out
                  </button>
                </div>
                <Field label="Quantity">
                  <Input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </Field>
                <Field label="Reason">
                  <Input
                    required
                    placeholder="e.g. Purchase order received, damaged goods..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Field>
                {error && <p className="text-xs text-rose-600">{error}</p>}
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Saving..." : "Record movement"}
                </Button>
              </form>
            </Card>
          )}
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
