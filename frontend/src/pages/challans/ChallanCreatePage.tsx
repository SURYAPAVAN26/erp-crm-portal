import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus } from "lucide-react";
import { listCustomers } from "../../api/customers";
import { listProducts } from "../../api/products";
import { createChallan } from "../../api/challans";
import { Customer, Product } from "../../types";
import { Button, Card, Field, PageHeader, Select } from "../../components/ui";
import { getErrorMessage } from "../../api/client";
import { formatCurrency } from "../../lib/format";

interface Line {
  productId: string;
  quantity: number;
}

export default function ChallanCreatePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<"DRAFT" | "CONFIRMED" | null>(null);

  useEffect(() => {
    listCustomers({ pageSize: 100 }).then((res) => setCustomers(res.data));
    listProducts({ pageSize: 200 }).then((res) => setProducts(res.data));
  }, []);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((ls) => [...ls, { productId: "", quantity: 1 }]);
  }
  function removeLine(index: number) {
    setLines((ls) => ls.filter((_, i) => i !== index));
  }

  function productById(id: string) {
    return products.find((p) => p.id === id);
  }

  const validLines = lines.filter((l) => l.productId && l.quantity > 0);
  const total = validLines.reduce((sum, l) => {
    const p = productById(l.productId);
    return sum + (p ? Number(p.unitPrice) * l.quantity : 0);
  }, 0);

  async function handleSave(status: "DRAFT" | "CONFIRMED", e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!customerId) {
      setError("Please select a customer");
      return;
    }
    if (validLines.length === 0) {
      setError("Please add at least one product line");
      return;
    }
    setSaving(status);
    try {
      const challan = await createChallan({
        customerId,
        status,
        items: validLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      });
      navigate(`/challans/${challan.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="New sales challan" subtitle="Select a customer and add products to generate a challan" />

      <Card>
        <form className="space-y-5">
          <Field label="Customer">
            <Select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.businessName ? `(${c.businessName})` : ""}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Products</span>
              <Button type="button" variant="ghost" onClick={addLine}>
                <Plus size={14} /> Add line
              </Button>
            </div>

            <div className="space-y-2">
              {lines.map((line, idx) => {
                const product = productById(line.productId);
                const insufficient = product ? line.quantity > product.currentStock : false;
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <Select
                      className="flex-1"
                      value={line.productId}
                      onChange={(e) => updateLine(idx, { productId: e.target.value })}
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {p.currentStock} in stock
                        </option>
                      ))}
                    </Select>
                    <input
                      type="number"
                      min={1}
                      className="w-24 rounded-lg border-0 px-3 py-2 text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600"
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, { quantity: parseInt(e.target.value || "1", 10) })}
                    />
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                    {insufficient && (
                      <span className="self-center text-xs text-rose-500 whitespace-nowrap">insufficient stock</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">Estimated total</span>
            <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={saving !== null} onClick={(e) => handleSave("DRAFT", e as never)}>
              {saving === "DRAFT" ? "Saving..." : "Save as draft"}
            </Button>
            <Button type="button" disabled={saving !== null} onClick={(e) => handleSave("CONFIRMED", e as never)}>
              {saving === "CONFIRMED" ? "Confirming..." : "Confirm & deduct stock"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
