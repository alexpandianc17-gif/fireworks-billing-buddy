import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Save, Trash2, Plus, Check, X, Settings } from "lucide-react";
import { useBilling, type Company, type CompanyProfile } from "@/store/billing";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { authed, config, saveConfig, companies, saveCompany, addCompany, deleteCompany, products, addProduct, deleteProduct, loading } = useBilling();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  // Sync form when config is loaded
  useEffect(() => {
    setForm(config);
  }, [config]);

  const [np, setNp] = useState<{ company: string; name: string; unit: string }>({
    company: "Both",
    name: "",
    unit: "nos",
  });
  const [pErr, setPErr] = useState("");

  const [newCompany, setNewCompany] = useState<CompanyProfile>({
    name: "", address: "", gstin: "", licNo: "",
    bankName: "", accountNo: "", ifsc: "", branch: ""
  });
  const [addingCompany, setAddingCompany] = useState(false);

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
    const res = addProduct(np as any);
    if (!res.ok) setPErr(res.error || "Error");
    else setNp({ company: "Both", name: "", unit: "nos" });
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) return;
    await addCompany(newCompany);
    setNewCompany({ name: "", address: "", gstin: "", licNo: "", bankName: "", accountNo: "", ifsc: "", branch: "" });
    setAddingCompany(false);
  };

  return (
    <div className="min-h-screen bg-[#fdf6e3]">
      <TopNav />
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold text-[#4a3728]">Settings</h1>
          <button 
            onClick={() => setAddingCompany(true)}
            className="bg-[#c0421b] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#a03616] transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" /> Add New Company
          </button>
        </div>

        {/* New Company Modal-like section */}
        {addingCompany && (
          <section className="bg-white border-4 border-[#c0421b]/20 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#c0421b]">Register New Company</h2>
              <button onClick={() => setAddingCompany(false)} className="text-muted-foreground hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCompany} className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Field label="Company Name">
                  <input
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-3 bg-white focus:border-[#c0421b] outline-none font-bold"
                    placeholder="e.g. Jayakavi Fire Works"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Address (formatted for bill)">
                  <textarea
                    value={newCompany.address}
                    rows={3}
                    onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                    className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-3 bg-white focus:border-[#c0421b] outline-none"
                  />
                </Field>
              </div>
              <Field label="GSTIN">
                <input
                  value={newCompany.gstin}
                  onChange={(e) => setNewCompany({ ...newCompany, gstin: e.target.value })}
                  className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-3 bg-white focus:border-[#c0421b] outline-none"
                />
              </Field>
              <Field label="License No">
                <input
                  value={newCompany.licNo}
                  onChange={(e) => setNewCompany({ ...newCompany, licNo: e.target.value })}
                  className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-3 bg-white focus:border-[#c0421b] outline-none"
                />
              </Field>
              <div className="md:col-span-2 pt-4 border-t border-[#d4bc8d]/20">
                <p className="text-[#8b6d4d] font-bold uppercase tracking-wider text-xs mb-4">Bank Details</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Bank Name">
                    <input
                      value={newCompany.bankName}
                      onChange={(e) => setNewCompany({ ...newCompany, bankName: e.target.value })}
                      className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 bg-white"
                    />
                  </Field>
                  <Field label="Account Number">
                    <input
                      value={newCompany.accountNo}
                      onChange={(e) => setNewCompany({ ...newCompany, accountNo: e.target.value })}
                      className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 bg-white"
                    />
                  </Field>
                  <Field label="IFSC Code">
                    <input
                      value={newCompany.ifsc}
                      onChange={(e) => setNewCompany({ ...newCompany, ifsc: e.target.value })}
                      className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 bg-white"
                    />
                  </Field>
                  <Field label="Branch">
                    <input
                      value={newCompany.branch}
                      onChange={(e) => setNewCompany({ ...newCompany, branch: e.target.value })}
                      className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 bg-white"
                    />
                  </Field>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                 <button type="button" onClick={() => setAddingCompany(false)} className="px-6 py-3 font-bold text-[#8b6d4d]">Cancel</button>
                 <button type="submit" className="bg-[#c0421b] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">Create Company Profile</button>
              </div>
            </form>
          </section>
        )}

        <section className="bg-white/80 backdrop-blur-sm border-2 border-[#d4bc8d]/30 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#4a3728] mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#c0421b]" /> App Configuration
          </h2>
          <form onSubmit={save} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Master PIN">
              <input
                value={form.pin || ""}
                maxLength={6}
                onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
                className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 focus:border-[#c0421b] outline-none font-mono font-bold"
              />
            </Field>
            <Field label="Default Discount (%)">
              <input
                type="number"
                value={form.defaultDiscount || 0}
                onChange={(e) => setForm({ ...form, defaultDiscount: +e.target.value })}
                className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 focus:border-[#c0421b] outline-none no-spinner"
              />
            </Field>
            <Field label="Mahamai Rate (%)">
              <input
                type="number"
                step="0.01"
                value={form.mahamaiRate || 0}
                onChange={(e) => setForm({ ...form, mahamaiRate: +e.target.value })}
                className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 focus:border-[#c0421b] outline-none no-spinner"
              />
            </Field>
            <div className="md:col-span-full flex justify-end items-center gap-4 mt-2">
              {saved && <span className="text-green-600 font-bold flex items-center gap-1 animate-bounce"><Check className="w-5 h-5" /> Saved!</span>}
              <button type="submit" disabled={loading} className="bg-[#4a3728] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#36281d] transition-all">Update App Settings</button>
            </div>
          </form>
        </section>

        {/* Dynamic Company Profiles */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#4a3728] px-2">Company Profiles</h2>
          {companies.map((company, index) => (
            <CompanyCard 
              key={company.name} 
              company={company} 
              onSave={(updated) => saveCompany(updated, index)} 
              onDelete={() => deleteCompany(index)}
              loading={loading}
            />
          ))}
        </div>

        <section className="bg-white/80 backdrop-blur-sm border-2 border-[#d4bc8d]/30 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#4a3728] mb-6">Product Management</h2>
          <form onSubmit={addP} className="grid md:grid-cols-4 gap-4 mb-8">
            <select
              value={np.company}
              onChange={(e) => setNp({ ...np, company: e.target.value })}
              className="border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 bg-white outline-none"
            >
              <option value="Both">Both Companies</option>
              {companies.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <input
              placeholder="Product name"
              value={np.name}
              onChange={(e) => setNp({ ...np, name: e.target.value })}
              className="border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-2 outline-none md:col-span-2"
            />
            <button type="submit" className="bg-[#c0421b] text-white rounded-xl px-6 py-2 font-bold shadow-md hover:shadow-lg transition-all">Add Item</button>
          </form>

          <div className="overflow-hidden border-2 border-[#d4bc8d]/20 rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-[#d4bc8d]/10 text-[#4a3728] font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Company</th>
                  <th className="px-6 py-4 text-left">Product Name</th>
                  <th className="px-6 py-4 text-left">HSN</th>
                  <th className="px-6 py-4 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d4bc8d]/10">
                {products.map((p) => (
                  <tr key={p.code} className="hover:bg-[#d4bc8d]/5 transition-colors">
                    <td className="px-6 py-4"><span className="bg-[#d4bc8d]/20 text-[#4a3728] px-2 py-1 rounded text-[10px] font-bold">{p.company}</span></td>
                    <td className="px-6 py-4 font-bold text-[#4a3728]">{p.name}</td>
                    <td className="px-6 py-4 text-[#8b6d4d]">{p.hsn}</td>
                    <td className="px-6 py-4 text-right pr-10">
                      <button onClick={() => deleteProduct(p.code)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function CompanyCard({ company, onSave, onDelete, loading }: { company: CompanyProfile, onSave: (c: CompanyProfile) => void, onDelete: () => void, loading: boolean }) {
  const [data, setData] = useState(company);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(data);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${company.name}? This will remove it from the system.`)) {
      await onDelete();
    }
  };

  return (
    <div className="bg-white border-2 border-[#d4bc8d]/20 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-extrabold text-[#c0421b] uppercase tracking-wider">{data.name}</h3>
          <div className="flex items-center gap-3">
            {saved && <span className="text-green-500 font-bold text-sm">Saved!</span>}
            {dirty && <button type="submit" disabled={loading} className="bg-[#c0421b] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-md">Save Changes</button>}
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-red-400 hover:text-red-600 transition-colors"
              title="Delete Company"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Field label="Bill Address">
              <textarea 
                value={data.address} 
                onChange={e => { setData({...data, address: e.target.value}); setDirty(true); }}
                rows={3} 
                className="w-full border-2 border-[#d4bc8d]/10 rounded-xl px-4 py-2 outline-none focus:border-[#c0421b]"
              />
            </Field>
          </div>
          <Field label="GSTIN">
            <input value={data.gstin} onChange={e => { setData({...data, gstin: e.target.value}); setDirty(true); }} className="w-full border-2 border-[#d4bc8d]/10 rounded-xl px-4 py-2 outline-none focus:border-[#c0421b]" />
          </Field>
          <Field label="License No">
            <input value={data.licNo} onChange={e => { setData({...data, licNo: e.target.value}); setDirty(true); }} className="w-full border-2 border-[#d4bc8d]/10 rounded-xl px-4 py-2 outline-none focus:border-[#c0421b]" />
          </Field>
          
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4 bg-[#fdf6e3]/50 p-4 rounded-2xl border border-[#d4bc8d]/10">
            <Field label="Bank">
              <input value={data.bankName} onChange={e => { setData({...data, bankName: e.target.value}); setDirty(true); }} className="w-full border-2 border-[#d4bc8d]/10 rounded-xl px-4 py-2 outline-none" />
            </Field>
            <Field label="Account No">
              <input value={data.accountNo} onChange={e => { setData({...data, accountNo: e.target.value}); setDirty(true); }} className="w-full border-2 border-[#d4bc8d]/10 rounded-xl px-4 py-2 outline-none" />
            </Field>
            <Field label="IFSC">
              <input value={data.ifsc} onChange={e => { setData({...data, ifsc: e.target.value}); setDirty(true); }} className="w-full border-2 border-[#d4bc8d]/10 rounded-xl px-4 py-2 outline-none" />
            </Field>
            <Field label="Branch">
              <input value={data.branch} onChange={e => { setData({...data, branch: e.target.value}); setDirty(true); }} className="w-full border-2 border-[#d4bc8d]/10 rounded-xl px-4 py-2 outline-none" />
            </Field>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#8b6d4d] ml-1">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
