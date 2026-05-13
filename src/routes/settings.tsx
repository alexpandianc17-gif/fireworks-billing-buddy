import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Trash2, Plus, Check } from "lucide-react";
import { useBilling, type Company } from "@/store/billing";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { authed, config, saveConfig, products, addProduct, deleteProduct, isLoading: loading } = useBilling();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);
  const [np, setNp] = useState<{ company: Company; name: string; unit: string }>({
    company: "Both",
    name: "",
    unit: "nos",
  });
  const [pErr, setPErr] = useState("");

  if (!authed) return <Navigate to="/" />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addP = (e: React.FormEvent) => {
    e.preventDefault();
    setPErr("");
    if (!np.name.trim()) {
      setPErr("Name required");
      return;
    }
    const res = addProduct(np);
    if (!res.ok) setPErr(res.error || "Error");
    else setNp({ company: "Both", name: "", unit: "nos" });
  };

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>

        <section className="bg-card border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">App Configuration</h2>
          <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
            <Field label="Master PIN">
              <input
                value={form.PIN}
                maxLength={6}
                onChange={(e) => setForm({ ...form, PIN: e.target.value.replace(/\D/g, "") })}
                className="w-full border rounded px-3 py-2 bg-background"
              />
            </Field>
            <Field label="Default Discount (%)">
              <input
                type="number"
                value={form.Default_Discount}
                onChange={(e) => setForm({ ...form, Default_Discount: +e.target.value })}
                className="w-full border rounded px-3 py-2 bg-background"
              />
            </Field>
            <Field label="Default CGST (%)">
              <input
                type="number"
                value={form.CGST_Rate}
                onChange={(e) => setForm({ ...form, CGST_Rate: +e.target.value })}
                className="w-full border rounded px-3 py-2 bg-background"
              />
            </Field>
            <Field label="Default SGST (%)">
              <input
                type="number"
                value={form.SGST_Rate}
                onChange={(e) => setForm({ ...form, SGST_Rate: +e.target.value })}
                className="w-full border rounded px-3 py-2 bg-background"
              />
            </Field>
            <Field label="Default IGST (%)">
              <input
                type="number"
                value={form.IGST_Rate}
                onChange={(e) => setForm({ ...form, IGST_Rate: +e.target.value })}
                className="w-full border rounded px-3 py-2 bg-background"
              />
            </Field>
            <div className="md:col-span-2 flex justify-end items-center gap-3">
              {saved && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Saved
                </span>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-festive text-primary-foreground font-semibold px-5 py-2.5 rounded-lg shadow-festive flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save Configuration
              </button>
            </div>
          </form>
        </section>

        <section className="bg-card border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Product Management</h2>
          <form onSubmit={addP} className="grid md:grid-cols-4 gap-3 mb-6">
            <select
              value={np.company}
              onChange={(e) => setNp({ ...np, company: e.target.value as Company })}
              className="border rounded px-3 py-2 bg-background"
            >
              <option value="Both">Both</option>
              <option value="Jayakavi">Jayakavi</option>
              <option value="Thangakaviya">Thangakaviya</option>
            </select>
            <input
              placeholder="Product name"
              value={np.name}
              onChange={(e) => setNp({ ...np, name: e.target.value })}
              className="border rounded px-3 py-2 bg-background md:col-span-2"
            />
            <input
              placeholder="Unit"
              value={np.unit}
              onChange={(e) => setNp({ ...np, unit: e.target.value })}
              className="border rounded px-3 py-2 bg-background"
            />
            {pErr && <p className="text-destructive text-sm md:col-span-3">{pErr}</p>}
            <button
              type="submit"
              className="md:col-start-4 bg-primary text-primary-foreground rounded-lg px-4 py-2 flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </form>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-accent/40 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">Company</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">HSN</th>
                  <th className="px-3 py-2 text-left">Unit</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{p.company}</td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.hsn || "3604"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.unit}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => deleteProduct(p.name)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
