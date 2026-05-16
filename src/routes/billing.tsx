import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Plus, Trash2, Download, Eye, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useBilling, type Invoice } from "@/store/billing";
import { saveInvoiceAction } from "@/lib/billing-actions";
import { TopNav } from "@/components/TopNav";
import { ProductCombobox } from "@/components/ProductCombobox";

export const Route = createFileRoute("/billing")({
  component: BillingPage,
});

interface Row {
  id: string;
  cases: number;
  code: string;
  name: string;
  hsn: string;
  qty: number;
  unit: string;
  packing: string;
  rate: number;
}

const blankRow = (): Row => ({
  id: Math.random().toString(36).slice(2),
  cases: 0,
  code: "",
  name: "",
  hsn: "3604",
  qty: 0,
  unit: "nos",
  packing: "",
  rate: 0,
});

function BillingPage() {
  const { authed, selectedCompany, products, customers, config } = useBilling();
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
  const [discount, setDiscount] = useState<number>(config.defaultDiscount);
  const [handling, setHandling] = useState(0);
  const [mahamai, setMahamai] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [freight, setFreight] = useState(0);
  const [taxType, setTaxType] = useState<"Inter-state" | "Intra-state">("Intra-state");
  const [cgst, setCgst] = useState(config.cgstRate);
  const [sgst, setSgst] = useState(config.sgstRate);
  const [igst, setIgst] = useState(config.igstRate);

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);


  if (!authed) return <Navigate to="/" />;
  if (!selectedCompany) return <Navigate to="/dashboard" />;

  const companyName =
    selectedCompany === "Jayakavi" ? "Jayakavi Fire Works" : "Sri Thangakaviya Fireworks";

  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () => {
    const nr = blankRow();
    setRows((rs) => [...rs, nr]);
    setFocusedRowId(nr.id);
  };
  const removeRow = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));

  const lineTotals = rows.map((r) => r.qty * r.rate);
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  const discountAmt = (subtotal * discount) / 100;
  
  // Calculate mahamai based on subtotal if not manually overridden
  const calculatedMahamai = (subtotal * config.mahamaiRate) / 100;
  const currentMahamai = mahamai === 0 ? calculatedMahamai : mahamai;

  const taxable = subtotal - discountAmt + handling + currentMahamai + insurance + freight;
  const cgstAmt = taxType === "Intra-state" ? (taxable * cgst) / 100 : 0;
  const sgstAmt = taxType === "Intra-state" ? (taxable * sgst) / 100 : 0;
  const igstAmt = taxType === "Inter-state" ? (taxable * igst) / 100 : 0;
  const taxAmount = cgstAmt + sgstAmt + igstAmt;
  const grandTotal = taxable + cgstAmt + sgstAmt + igstAmt;

  const generatePDF = async () => {
    // 1. Validation
    if (!header.customerName.trim()) {
      alert("Please enter a customer name.");
      return;
    }
    const validRows = rows.filter(r => r.name && r.qty > 0);
    if (validRows.length === 0) {
      alert("Please add at least one product with quantity.");
      return;
    }

    if (!invoiceRef.current || generating) return;
    setGenerating(true);
    
    // Add PDF-safe styles temporarily
    invoiceRef.current.classList.add("pdf-mode");
    await new Promise(r => setTimeout(r, 100)); // Small delay for styles to apply
    
    try {
      // 2. Generate PDF
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (doc) => {
          // FORCE REMOVE ALL MODERN COLORS in the PDF clone
          const all = doc.querySelectorAll("*");
          all.forEach((el: any) => {
            const style = window.getComputedStyle(el);
            if (style.color.includes("okl")) el.style.color = "#1a120b";
            if (style.backgroundColor.includes("okl")) el.style.backgroundColor = "#ffffff";
            if (style.borderColor.includes("okl")) el.style.borderColor = "#e5d9cc";
          });
        }
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgH = (imgProps.height * pdfW) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, imgH);
      pdf.save(`${header.invoiceNo}.pdf`);

      // 3. Save to Google Sheets
      const invoiceData: Invoice = {
        invoiceNo: header.invoiceNo,
        date: header.date,
        subTotal: subtotal,
        discount: discountAmt,
        packingCharges: handling,
        freight: freight,
        mahamai: currentMahamai,
        insurance: insurance,
        taxAmount: cgstAmt + sgstAmt + igstAmt,
        netTotal: grandTotal,
        itemsJson: JSON.stringify(validRows),
      };
      
      await (saveInvoiceAction as any)({ data: invoiceData });
      
    } catch (error) {
      console.error("Failed to generate bill:", error);
      alert("Something went wrong while generating the bill. Please try again.");
    } finally {
      invoiceRef.current?.classList.remove("pdf-mode");
      setGenerating(false);
      setIsPreview(false);
    }
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fdf6e3]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/dashboard_background.png"
          className="w-full h-full object-cover opacity-80"
          alt=""
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <TopNav />
        <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Billing for</p>
            <h1 className="text-3xl font-bold">{companyName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreview(true)}
              className="bg-white/50 text-[#8b6d4d] hover:text-[#c0421b] border-2 border-[#d4bc8d]/20 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 hover:bg-white shadow-sm"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={generatePDF}
              disabled={generating}
              className="bg-festive text-white px-6 py-2 rounded-xl text-sm font-bold shadow-festive hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
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

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase font-bold text-muted-foreground mb-2">Bill To</p>
                <div className="relative group">
                  <select
                    className="w-full border-2 border-[#d4bc8d]/30 rounded-xl px-4 py-3 bg-white/50 focus:border-[#c0421b] outline-none transition-all appearance-none"
                    onChange={(e) => {
                      const c = customers.find((x) => x.name === e.target.value);
                      if (c) {
                        setHeader({
                          ...header,
                          customerName: c.name,
                          customerAddress: `${c.address1}, ${c.address2}, ${c.address3}`,
                          customerGstin: c.gstin,
                        });
                      }
                    }}
                  >
                    <option value="">Select Existing Customer...</option>
                    {customers.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b6d4d]">
                    ▼
                  </div>
                </div>
              </div>
              
              <input
                placeholder="Customer Name"
                value={header.customerName}
                onChange={(e) => setHeader({ ...header, customerName: e.target.value })}
                className="w-full border-2 border-[#d4bc8d]/20 rounded-xl px-4 py-2 bg-white/30 focus:border-[#c0421b] outline-none"
              />
              <textarea
                placeholder="Customer Address"
                value={header.customerAddress}
                onChange={(e) => setHeader({ ...header, customerAddress: e.target.value })}
                rows={2}
                className="w-full border-2 border-[#d4bc8d]/20 rounded-xl px-4 py-2 bg-white/30 focus:border-[#c0421b] outline-none"
              />
              <div className="flex gap-4">
                <input
                  placeholder="GSTIN"
                  value={header.customerGstin}
                  onChange={(e) => setHeader({ ...header, customerGstin: e.target.value })}
                  className="flex-1 border-2 border-[#d4bc8d]/20 rounded-xl px-4 py-2 bg-white/30 focus:border-[#c0421b] outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs uppercase font-bold text-muted-foreground mb-2">Transport & Delivery</p>
              <textarea
                placeholder="Transport / LR details / Destination"
                value={header.transport}
                onChange={(e) => setHeader({ ...header, transport: e.target.value })}
                rows={6}
                className="w-full border-2 border-[#d4bc8d]/20 rounded-xl px-4 py-2 bg-white/30 h-[190px] focus:border-[#c0421b] outline-none"
              />
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#fdf6e3] text-xs uppercase text-[#8b6d4d] border-y-2 border-[#d4bc8d]/30">
                <tr>
                  <th className="px-2 py-3 text-left">S.No</th>
                  <th className="px-2 py-3 text-left">Code</th>
                  <th className="px-2 py-3 text-left">Cases</th>
                  <th className="px-2 py-3 text-left">Particulars</th>
                  <th className="px-2 py-3 text-left">HSN</th>
                  <th className="px-2 py-3 text-left">Packing</th>
                  <th className="px-2 py-3 text-right">Qty</th>
                  <th className="px-2 py-3 text-left">Unit</th>
                  <th className="px-2 py-3 text-right">Rate</th>
                  <th className="px-2 py-3 text-right">Amount</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-b border-[#d4bc8d]/10 hover:bg-[#c0421b]/5 transition-colors">
                    <td className="px-2 py-3 font-medium text-[#4a3728]">{i + 1}</td>
                    <td className="px-2 py-3 text-[#8b6d4d] font-mono text-[10px]">{r.code}</td>
                    <td className="px-2 py-3 w-20">
                      <input
                        type="number"
                        min={0}
                        value={r.cases}
                        ref={(el) => {
                          if (r.id === focusedRowId && el) {
                            el.focus();
                            setFocusedRowId(null);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateRow(r.id, { cases: +e.target.value })}
                        className="w-full border-2 border-[#d4bc8d]/20 rounded-lg px-2 py-1 bg-white/50 focus:border-[#c0421b] outline-none no-spinner"
                      />
                    </td>
                    <td className="px-2 py-3 min-w-[16rem]">
                      <ProductCombobox
                        products={products}
                        value={r.name}
                        onSelect={(p) =>
                          updateRow(r.id, {
                            code: p.code,
                            name: p.name,
                            hsn: p.hsn,
                            unit: p.unit,
                            packing: p.packing,
                            rate: selectedCompany === "Jayakavi" ? p.rateA : p.rateB,
                          })
                        }
                      />
                    </td>
                    <td className="px-2 py-3 text-[#8b6d4d] text-xs">{r.hsn}</td>
                    <td className="px-2 py-3 text-[#8b6d4d] text-xs italic">{r.packing}</td>
                    <td className="px-2 py-3 w-20">
                      <input
                        type="number"
                        min={0}
                        value={r.qty}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateRow(r.id, { qty: +e.target.value })}
                        className="w-full border-2 border-[#d4bc8d]/20 rounded-lg px-2 py-1 bg-white/50 focus:border-[#c0421b] outline-none text-right no-spinner"
                      />
                    </td>
                    <td className="px-2 py-3 text-[#8b6d4d] text-xs">{r.unit}</td>
                    <td className="px-2 py-3 w-24">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={r.rate}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateRow(r.id, { rate: +e.target.value })}
                        className="w-full border-2 border-[#d4bc8d]/20 rounded-lg px-2 py-1 bg-white/50 focus:border-[#c0421b] outline-none text-right no-spinner"
                      />
                    </td>
                    <td className="px-2 py-3 text-right font-bold text-[#4a3728]">{fmt(r.qty * r.rate)}</td>
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

          {/* Totals Section */}
          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t-2 border-[#d4bc8d]/30">
            <div className="space-y-4">
              <p className="text-xs uppercase font-bold text-[#8b6d4d]">Adjustments & Tax</p>
              <div className="bg-white/40 rounded-2xl p-6 border-2 border-[#d4bc8d]/20 space-y-3">
                {(
                  [
                    ["Discount (%)", discount, setDiscount],
                    ["Packing Charges", handling, setHandling],
                    ["Mahamai", currentMahamai, setMahamai],
                    ["Insurance", insurance, setInsurance],
                    ["Freight", freight, setFreight],
                  ] as const
                ).map(([label, val, setter]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-[#4a3728]">{label}</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={val}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setter(+e.target.value)}
                      className="w-32 border-2 border-[#d4bc8d]/20 rounded-lg px-3 py-1.5 bg-white/50 focus:border-[#c0421b] outline-none text-right no-spinner"
                    />
                  </div>
                ))}
                <div className="pt-4 space-y-3 min-h-[140px]">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#4a3728]">Tax Type</label>
                    <select
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value as "Inter-state" | "Intra-state")}
                      className="w-40 border-2 border-[#d4bc8d]/20 rounded-lg px-3 py-1.5 bg-white/50 focus:border-[#c0421b] outline-none"
                    >
                      <option value="Intra-state">Intra-state (CGST/SGST)</option>
                      <option value="Inter-state">Inter-state (IGST)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-14">
                    {taxType === "Intra-state" ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-[#8b6d4d]">CGST (%)</label>
                          <input
                            type="number"
                            value={cgst}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setCgst(+e.target.value)}
                            className="w-full border-2 border-[#d4bc8d]/20 rounded-lg px-3 py-1.5 bg-white/50 focus:border-[#c0421b] outline-none no-spinner"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-[#8b6d4d]">SGST (%)</label>
                          <input
                            type="number"
                            value={sgst}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setSgst(+e.target.value)}
                            className="w-full border-2 border-[#d4bc8d]/20 rounded-lg px-3 py-1.5 bg-white/50 focus:border-[#c0421b] outline-none no-spinner"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#8b6d4d]">IGST (%)</label>
                        <input
                          type="number"
                          value={igst}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setIgst(+e.target.value)}
                          className="w-full border-2 border-[#d4bc8d]/20 rounded-lg px-3 py-1.5 bg-white/50 focus:border-[#c0421b] outline-none no-spinner"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#c0421b]/5 rounded-3xl p-8 space-y-4 border-2 border-[#c0421b]/10 h-fit">
              <p className="text-xs uppercase font-bold text-[#c0421b] mb-4">Final Summary</p>
              <SummaryRow label="Subtotal" value={fmt(subtotal)} />
              <SummaryRow label={`Discount (${discount}%)`} value={`- ${fmt(discountAmt)}`} />
              <SummaryRow label="Packing Charges" value={fmt(handling)} />
              <SummaryRow label="Mahamai" value={fmt(currentMahamai)} />
              <SummaryRow label="Insurance" value={fmt(insurance)} />
              <SummaryRow label="Freight" value={fmt(freight)} />
              <div className="border-t border-[#c0421b]/10 my-4" />
              <SummaryRow label="Taxable Value" value={fmt(taxable)} bold />
              {taxType === "Intra-state" ? (
                <>
                  <SummaryRow label={`CGST @ ${cgst}%`} value={fmt(cgstAmt)} />
                  <SummaryRow label={`SGST @ ${sgst}%`} value={fmt(sgstAmt)} />
                </>
              ) : (
                <SummaryRow label={`IGST @ ${igst}%`} value={fmt(igstAmt)} />
              )}
              <div className="border-t-2 border-[#c0421b]/20 my-6" />
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-[#8b6d4d]">Total Payable</span>
                <span className="text-3xl font-black text-[#c0421b]">₹ {fmt(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {isPreview && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-5xl h-full overflow-auto rounded-2xl relative shadow-2xl">
            <div className="sticky top-0 z-[110] bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#c0421b]" />
                <h3 className="font-bold text-[#4a3728]">Bill Preview</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generatePDF}
                  className="bg-[#c0421b] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#a03616]"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button 
                  onClick={() => setIsPreview(false)}
                  className="bg-gray-100 text-gray-500 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 pb-20">
              <div className="max-w-[210mm] mx-auto bg-white border rounded-lg shadow-sm p-12 space-y-8">
                {/* Simplified preview header */}
                <div className="flex justify-between items-start border-b-4 border-[#c0421b] pb-6">
                  <div>
                    <h2 className="text-3xl font-black text-[#c0421b]">{selectedCompany === "Jayakavi" ? "SREE JAYAKAVI FIREWORKS" : "SRI THANGAKAVIYA FIREWORKS"}</h2>
                    <p className="text-sm text-[#8b6d4d] tracking-widest uppercase">Quality Manufacturers of High-Grade Fireworks</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#4a3728]">INVOICE</p>
                    <p className="text-[#8b6d4d]">#{header.invoiceNo}</p>
                    <p className="text-[#8b6d4d]">{header.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="space-y-1">
                    <p className="font-bold text-[#c0421b] uppercase text-[10px]">Bill To</p>
                    <p className="font-black text-lg text-[#4a3728]">{header.customerName}</p>
                    <p className="text-[#8b6d4d] whitespace-pre-wrap">{header.customerAddress}</p>
                    {header.customerGstin && <p className="text-[#8b6d4d]">GSTIN: {header.customerGstin}</p>}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-[#c0421b] uppercase text-[10px]">Transport</p>
                    <p className="text-[#8b6d4d] whitespace-pre-wrap">{header.transport || "Self"}</p>
                  </div>
                </div>

                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#fdfcfb] border-y-2 border-[#d4bc8d]/20 text-[#4a3728]">
                      <th className="text-left py-3 px-2">Description</th>
                      <th className="text-center py-3 px-2">HSN</th>
                      <th className="text-center py-3 px-2">Qty</th>
                      <th className="text-right py-3 px-2">Rate</th>
                      <th className="text-right py-3 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4bc8d]/10">
                    {rows.filter(r => r.name).map(r => (
                      <tr key={r.id}>
                        <td className="py-3 px-2 font-bold">{r.name} <span className="text-[10px] text-gray-400 font-normal ml-2">{r.packing}</span></td>
                        <td className="text-center py-3 px-2 text-gray-500">{r.hsn}</td>
                        <td className="text-center py-3 px-2">{r.qty} {r.unit}</td>
                        <td className="text-right py-3 px-2">{r.rate.toFixed(2)}</td>
                        <td className="text-right py-3 px-2 font-bold">{(r.qty * r.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end pt-8">
                  <div className="w-72 space-y-3 bg-[#fdfcfb] p-6 rounded-xl border border-[#d4bc8d]/20">
                    <div className="flex justify-between text-[#8b6d4d] text-xs"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-green-600 text-xs"><span>Discount ({discount}%):</span><span>- ₹{discountAmt.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-[#8b6d4d] text-xs"><span>Tax Amount:</span><span>₹{taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[#4a3728] font-black text-xl border-t-2 border-[#c0421b]/20 pt-3">
                      <span>Total:</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "font-bold text-[#4a3728]" : "text-[#8b6d4d]"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
