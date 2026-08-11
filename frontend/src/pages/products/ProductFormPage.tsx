import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, getProduct, updateProduct } from "../../api/products";
import { getErrorMessage } from "../../api/client";
import { Button, Card, Field, Input, PageHeader } from "../../components/ui";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minStockAlert: "0",
  location: "",
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    getProduct(id).then((p) => {
      setForm({
        name: p.name,
        sku: p.sku,
        category: p.category ?? "",
        unitPrice: String(p.unitPrice),
        currentStock: String(p.currentStock),
        minStockAlert: String(p.minStockAlert),
        location: p.location ?? "",
      });
      setLoading(false);
    });
  }, [id]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category || undefined,
        unitPrice: parseFloat(form.unitPrice),
        currentStock: isEdit ? undefined : parseInt(form.currentStock, 10),
        minStockAlert: parseInt(form.minStockAlert, 10),
        location: form.location || undefined,
      };
      if (isEdit && id) {
        await updateProduct(id, payload as never);
        navigate(`/products/${id}`);
      } else {
        const created = await createProduct(payload as never);
        navigate(`/products/${created.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="max-w-xl">
      <PageHeader title={isEdit ? "Edit product" : "Add product"} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Product name">
            <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU / code">
              <Input required value={form.sku} onChange={(e) => update("sku", e.target.value)} />
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(e) => update("category", e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Unit price (₹)">
              <Input type="number" step="0.01" min="0" required value={form.unitPrice} onChange={(e) => update("unitPrice", e.target.value)} />
            </Field>
            <Field label="Min stock alert qty">
              <Input type="number" min="0" required value={form.minStockAlert} onChange={(e) => update("minStockAlert", e.target.value)} />
            </Field>
          </div>

          {!isEdit && (
            <Field label="Opening stock" hint="Further stock changes are made via Stock In / Stock Out">
              <Input type="number" min="0" required value={form.currentStock} onChange={(e) => update("currentStock", e.target.value)} />
            </Field>
          )}

          <Field label="Warehouse / location">
            <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
          </Field>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add product"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
