import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { useBilling } from "@/store/billing";
import { TopNav } from "@/components/TopNav";
import { ProductCombobox } from "@/components/ProductCombobox";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

interface Row {
  id: string;
  cases: number | string;
  productId: string;
  name: string;
  hsn: string;
  qty: number | string;
  unit: string;
  rate: number | string;
}

const blankRow = (): Row => ({
  id: Math.random().toString(36).slice(2),
  cases: "",
  productId: "",
  name: "",
  hsn: "3604",
  qty: "",
  unit: "nos",
  rate: "",
});

function BillingPage() {
  const { authed, selectedCompany, products, config, fetchData } = useBilling();

  useEffect(() => {
    if (products.length === 0) {
      fetchData();
    }
  }, [products.length, fetchData]);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.company === selectedCompany || p.company === "Both"),
    [products, selectedCompany],
  );

  const today = new Date().toISOString().slice(0, 10);
  const [header, setHeader] = useState({
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    date: today,
    customerName: "",
    customerAddress: "",
    customerGstin: "",
    transport: "",
  });

  const [rows, setRows] = useState<Row[]>([blankRow()]);
  const [discount, setDiscount] = useState<number>(config.Default_Discount);
  const [handling, setHandling] = useState(0);
  const [mahamai, setMahamai] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [freight, setFreight] = useState(0);
  const [taxType, setTaxType] = useState<"Inter-state" | "Intra-state">("Intra-state");
  const [cgst, setCgst] = useState(config.CGST_Rate);
  const [sgst, setSgst] = useState(config.SGST_Rate);
  const [igst, setIgst] = useState(config.IGST_Rate);

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  if (!authed) return <Navigate to="/" />;
  if (!selectedCompany) return <Navigate to="/dashboard" />;

  const companyName =
    selectedCompany === "Jayakavi" ? "Jayakavi Fire Works" : "Sri Thangakaviya Fireworks";

  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, blankRow()]);
  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: string) => {
    if (e.key === "Enter" && field === "rate") {
      e.preventDefault();
      if (index === rows.length - 1) addRow();
      else {
        setTimeout(() => document.getElementById(`row-${index + 1}-cases`)?.focus(), 0);
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.getElementById(`row-${index + 1}-${field}`)?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      document.getElementById(`row-${index - 1}-${field}`)?.focus();
    }
  };

  const lineTotals = rows.map((r) => (Number(r.qty) || 0) * (Number(r.rate) || 0));
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxable = subtotal - discountAmt + handling + mahamai + insurance + freight;
  const cgstAmt = taxType === "Intra-state" ? (taxable * cgst) / 100 : 0;
  const sgstAmt = taxType === "Intra-state" ? (taxable * sgst) / 100 : 0;
  const igstAmt = taxType === "Inter-state" ? (taxable * igst) / 100 : 0;
  const grandTotal = taxable + cgstAmt + sgstAmt + igstAmt;

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    setGenerating(true);
    invoiceRef.current.classList.add("pdf-mode");
    try {
      const dataUrl = await toPng(invoiceRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const ratio = imgProps.height / imgProps.width;
      const imgW = pageW;
      const imgH = imgW * ratio;
      let h = imgH;
      let pos = 0;
      if (h <= pageH) {
        pdf.addImage(dataUrl, "PNG", 0, 0, imgW, imgH);
      } else {
        while (h > 0) {
          pdf.addImage(dataUrl, "PNG", 0, pos, imgW, imgH);
          h -= pageH;
          pos -= pageH;
          if (h > 0) pdf.addPage();
        }
      }
      pdf.save(`${header.invoiceNo}.pdf`);
    } finally {
      invoiceRef.current?.classList.remove("pdf-mode");
      setGenerating(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Billing for</p>
            <h1 className="text-3xl font-bold">{companyName}</h1>
          </div>
          <button
            onClick={generatePDF}
            disabled={generating}
            className="bg-festive text-primary-foreground font-semibold px-5 py-3 rounded-lg shadow-festive flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {generating ? "Generating..." : "Generate PDF"}
          </button>
        </div>

        <div ref={invoiceRef} className="bg-card border rounded-2xl p-8 space-y-6">
          {/* Invoice header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <h2 className="text-2xl font-bold text-ember">{companyName}</h2>
              <p className="text-sm text-muted-foreground">Tax Invoice</p>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-2 justify-end">
                <label className="text-muted-foreground">Invoice No:</label>
                <input
                  value={header.invoiceNo}
                  onChange={(e) => setHeader({ ...header, invoiceNo: e.target.value })}
                  className="border rounded px-2 py-1 bg-background"
                />
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <label className="text-muted-foreground">Date:</label>
                <input
                  type="date"
                  value={header.date}
                  onChange={(e) => setHeader({ ...header, date: e.target.value })}
                  className="border rounded px-2 py-1 bg-background"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-muted-foreground">Bill To</p>
              <input
                placeholder="Customer Name"
                value={header.customerName}
                onChange={(e) => setHeader({ ...header, customerName: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-background"
              />
              <textarea
                placeholder="Customer Address"
                value={header.customerAddress}
                onChange={(e) => setHeader({ ...header, customerAddress: e.target.value })}
                rows={2}
                className="w-full border rounded px-3 py-2 bg-background"
              />
              <input
                placeholder="GSTIN"
                value={header.customerGstin}
                onChange={(e) => setHeader({ ...header, customerGstin: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-background"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-muted-foreground">Transport</p>
              <textarea
                placeholder="Transport / LR details"
                value={header.transport}
                onChange={(e) => setHeader({ ...header, transport: e.target.value })}
                rows={5}
                className="w-full border rounded px-3 py-2 bg-background"
              />
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/50 text-xs uppercase">
                <tr>
                  <th className="px-2 py-2 text-left">#</th>
                  <th className="px-2 py-2 text-left">Cases</th>
                  <th className="px-2 py-2 text-left">Product</th>
                  <th className="px-2 py-2 text-left">HSN</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-left">Unit</th>
                  <th className="px-2 py-2 text-right">Rate</th>
                  <th className="px-2 py-2 text-right">Amount</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-2 py-2">{i + 1}</td>
                    <td className="px-2 py-2 w-20">
                      <input
                        id={`row-${i}-cases`}
                        type="number"
                        min={0}
                        value={r.cases}
                        onChange={(e) => updateRow(r.id, { cases: e.target.value === "" ? "" : Number(e.target.value) })}
                        onKeyDown={(e) => handleKeyDown(e, i, "cases")}
                        className="w-full border rounded px-2 py-1 bg-background"
                      />
                    </td>
                    <td className="px-2 py-2 min-w-[16rem]">
                      <ProductCombobox
                        products={filteredProducts}
                        value={r.name}
                        onSelect={(p) => {
                          updateRow(r.id, {
                            productId: p.name,
                            name: p.name,
                            hsn: p.hsn,
                            unit: p.unit,
                          });
                          setTimeout(() => document.getElementById(`row-${i}-qty`)?.focus(), 0);
                        }}
                      />
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{r.hsn}</td>
                    <td className="px-2 py-2 w-20">
                      <input
                        id={`row-${i}-qty`}
                        type="number"
                        min={0}
                        value={r.qty}
                        onChange={(e) => updateRow(r.id, { qty: e.target.value === "" ? "" : Number(e.target.value) })}
                        onKeyDown={(e) => handleKeyDown(e, i, "qty")}
                        className="w-full border rounded px-2 py-1 bg-background text-right"
                      />
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{r.unit}</td>
                    <td className="px-2 py-2 w-24">
                      <input
                        id={`row-${i}-rate`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.rate}
                        onChange={(e) => updateRow(r.id, { rate: e.target.value === "" ? "" : Number(e.target.value) })}
                        onKeyDown={(e) => handleKeyDown(e, i, "rate")}
                        className="w-full border rounded px-2 py-1 bg-background text-right"
                      />
                    </td>
                    <td className="px-2 py-2 text-right font-medium">{fmt((Number(r.qty) || 0) * (Number(r.rate) || 0))}</td>
                    <td className="px-2 py-2">
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(r.id)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addRow}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="w-4 h-4" /> Add row
            </button>
          </div>

          {/* Totals */}
          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-3">
              <p className="text-xs uppercase font-semibold text-muted-foreground">Adjustments</p>
              {(
                [
                  ["Discount (%)", discount, setDiscount],
                  ["Handling", handling, setHandling],
                  ["Mahamai", mahamai, setMahamai],
                  ["Insurance", insurance, setInsurance],
                  ["Freight", freight, setFreight],
                ] as const
              ).map(([label, val, setter]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <label className="text-sm">{label}</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={val}
                    onChange={(e) => setter(+e.target.value)}
                    className="w-32 border rounded px-2 py-1 bg-background text-right"
                  />
                </div>
              ))}
              <div className="pt-3">
                <label className="text-sm font-medium">Tax Type</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value as "Inter-state" | "Intra-state")}
                  className="w-full mt-1 border rounded px-2 py-2 bg-background"
                >
                  <option value="Intra-state">Intra-state</option>
                  <option value="Inter-state">Inter-state</option>
                </select>
              </div>
              {taxType === "Intra-state" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">CGST (%)</label>
                    <input
                      type="number"
                      value={cgst}
                      onChange={(e) => setCgst(+e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">SGST (%)</label>
                    <input
                      type="number"
                      value={sgst}
                      onChange={(e) => setSgst(+e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-muted-foreground">IGST (%)</label>
                  <input
                    type="number"
                    value={igst}
                    onChange={(e) => setIgst(+e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                  />
                </div>
              )}
            </div>

            <div className="bg-accent/30 rounded-xl p-5 space-y-2 text-sm h-fit">
              <Row label="Subtotal" value={fmt(subtotal)} />
              <Row label={`Discount (${discount}%)`} value={`- ${fmt(discountAmt)}`} />
              <Row label="Handling" value={fmt(handling)} />
              <Row label="Mahamai" value={fmt(mahamai)} />
              <Row label="Insurance" value={fmt(insurance)} />
              <Row label="Freight" value={fmt(freight)} />
              <div className="border-t my-2" />
              <Row label="Taxable Value" value={fmt(taxable)} bold />
              {taxType === "Intra-state" ? (
                <>
                  <Row label={`CGST @ ${cgst}%`} value={fmt(cgstAmt)} />
                  <Row label={`SGST @ ${sgst}%`} value={fmt(sgstAmt)} />
                </>
              ) : (
                <Row label={`IGST @ ${igst}%`} value={fmt(igstAmt)} />
              )}
              <div className="border-t my-2" />
              <div className="flex justify-between text-lg font-bold text-ember">
                <span>Grand Total</span>
                <span>₹ {fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
