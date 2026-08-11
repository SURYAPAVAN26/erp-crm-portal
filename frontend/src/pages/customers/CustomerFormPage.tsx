import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCustomer, getCustomer, updateCustomer } from "../../api/customers";
import { getErrorMessage } from "../../api/client";
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from "../../components/ui";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  address: "",
  status: "LEAD",
  followUpDate: "",
  notes: "",
};

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    getCustomer(id).then((c) => {
      setForm({
        name: c.name,
        mobile: c.mobile,
        email: c.email ?? "",
        businessName: c.businessName ?? "",
        gstNumber: c.gstNumber ?? "",
        customerType: c.customerType,
        address: c.address ?? "",
        status: c.status,
        followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : "",
        notes: c.notes ?? "",
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
        ...form,
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : undefined,
      };
      if (isEdit && id) {
        await updateCustomer(id, payload as never);
        navigate(`/customers/${id}`);
      } else {
        const created = await createCustomer(payload as never);
        navigate(`/customers/${created.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? "Edit customer" : "Add customer"} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer name">
              <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </Field>
            <Field label="Mobile number">
              <Input required value={form.mobile} onChange={(e) => update("mobile", e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Business name">
              <Input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="GST number" hint="Optional">
              <Input value={form.gstNumber} onChange={(e) => update("gstNumber", e.target.value)} />
            </Field>
            <Field label="Customer type">
              <Select value={form.customerType} onChange={(e) => update("customerType", e.target.value)}>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </Select>
            </Field>
          </div>

          <Field label="Address">
            <Textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </Select>
            </Field>
            <Field label="Follow-up date">
              <Input type="date" value={form.followUpDate} onChange={(e) => update("followUpDate", e.target.value)} />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </Field>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add customer"}
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
