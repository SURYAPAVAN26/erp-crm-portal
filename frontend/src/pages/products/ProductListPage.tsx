import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, AlertTriangle } from "lucide-react";
import { listProducts } from "../../api/products";
import { Product } from "../../types";
import { Button, Card, EmptyState, Input, PageHeader, Spinner } from "../../components/ui";
import { formatCurrency } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";
import { cx } from "../../lib/format";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "ADMIN" || user?.role === "WAREHOUSE";

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listProducts({ search: search || undefined, lowStock: lowStockOnly || undefined })
        .then((res) => setProducts(res.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, lowStockOnly]);

  return (
    <div>
      <PageHeader
        title="Products & Inventory"
        subtitle="Track stock levels and manage catalogue"
        actions={
          canManage ? (
            <Link to="/products/new">
              <Button>
                <Plus size={16} /> Add product
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search name or SKU..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button
          onClick={() => setLowStockOnly((v) => !v)}
          className={cx(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ring-1 ring-inset transition-colors",
            lowStockOnly ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
          )}
        >
          <AlertTriangle size={14} /> Low stock only
        </button>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No products found" description="Try adjusting filters or add a new product." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Unit price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.currentStock <= p.minStockAlert;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link to={`/products/${p.id}`} className="font-medium text-indigo-600 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="px-5 py-3 text-slate-600">{p.category || "-"}</td>
                    <td className="px-5 py-3 text-slate-600">{formatCurrency(p.unitPrice)}</td>
                    <td className="px-5 py-3">
                      <span className={cx("font-medium", low ? "text-rose-600" : "text-slate-700")}>
                        {p.currentStock}
                      </span>
                      {low && <span className="ml-1.5 text-xs text-rose-500">low</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{p.location || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
