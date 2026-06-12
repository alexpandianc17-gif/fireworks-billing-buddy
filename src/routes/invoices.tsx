import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Search,
  FileText,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Banknote,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";
import { useBilling } from "@/store/billing";
import { getInvoicesAction, recordPaymentAction } from "@/lib/billing-actions";
import { TopNav } from "@/components/TopNav";
import type { Invoice, Payment, PaymentStatus, TransportHeader } from "@/types/billing";
import { useReactToPrint } from "react-to-print";
import { JayakaviTemplate } from "@/components/JayakaviTemplate";
import { ThangakaviyaTemplate } from "@/components/ThangakaviyaTemplate";

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
});

const STATUS_CONFIG = {
  Paid: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" },
  Partial: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  Unpaid: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" },
};

function detectCompany(inv: Invoice): { label: string; color: string } {
  try {
    const data = JSON.parse(inv.itemsJson || "[]");
    const items = Array.isArray(data) ? data : (data.items || []);
    const firstCompany = items[0]?.company?.toLowerCase();
    
    if (firstCompany) {
      if (firstCompany.includes("thangakavi") || firstCompany.includes("tanka") || firstCompany.includes("tang")) {
        return { label: "Sri Thangakaviya", color: "bg-purple-100 text-purple-700" };
      }
      if (firstCompany.includes("jayakavi")) {
        return { label: "Jayakavi", color: "bg-orange-100 text-orange-700" };
      }
    }
  } catch (e) { /* ignore */ }

  // Fallback to invoice number heuristic (legacy/backwards compatibility)
  const no = inv.invoiceNo?.toUpperCase() || "";
  if (no.startsWith("T") || no.startsWith("TK") || no.includes("TANKA") || no.includes("TANG")) {
    return { label: "Sri Thangakaviya", color: "bg-purple-100 text-purple-700" };
  }
  return { label: "Sri Thangakaviya", color: "bg-purple-100 text-purple-700" };
}

function fmt(n: number) {
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function InvoicesPage() {
  const { authed, config, companies } = useBilling();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<Payment["Payment_Method"]>("Cash");
  const [payNote, setPayNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [printingInv, setPrintingInv] = useState<Invoice | null>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const loadInvoices = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getInvoicesAction();
      setInvoices((data as Invoice[]).reverse());
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loaded) {
      loadInvoices();
    }
  }, [loaded]);

  if (!authed) {
    return <Navigate to="/" />;
  }

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || inv.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const openPayDialog = (inv: Invoice) => {
    setPayingInvoice(inv);
    setPayAmount(Number(inv.balanceDue.toFixed(2)));
    setPayMethod("Cash");
    setPayNote("");
  };

  const handlePrint = useReactToPrint({
    content: () => pdfTemplateRef.current,
    documentTitle: printingInv?.invoiceNo || "Invoice",
    onAfterPrint: () => {
      setGeneratingId(null);
      setPrintingInv(null);
    },
  });

  const handleDownloadPDF = async (inv: Invoice) => {
    setPrintingInv(inv);
    setGeneratingId(inv.invoiceNo);
    
    setTimeout(() => {
      if (handlePrint) handlePrint();
    }, 500);
  };

  const handleRecordPayment = async () => {
    if (!payingInvoice || payAmount <= 0) return;
    setIsRecording(true);
    try {
      // Find the original row index (Invoices start at row 2 in the sheet)
      // We need the index in the unreversed array (the order they are in the sheet)
      const originalInvoices = [...invoices].reverse();
      const idx = originalInvoices.findIndex(inv => inv.invoiceNo === payingInvoice.invoiceNo);
      if (idx === -1) throw new Error("Invoice not found in local state");
      
      const sheetRowIndex = idx + 2;

      const newAmountReceived = payingInvoice.amountReceived + payAmount;
      const newBalanceDue = Math.max(0, payingInvoice.netTotal - newAmountReceived);
      const newStatus: PaymentStatus = newBalanceDue <= 0.01 ? "Paid" : "Partial";

      const payment: Payment = {
        Payment_ID: `PAY-${Date.now().toString().slice(-6)}`,
        Invoice_No: payingInvoice.invoiceNo,
        Date: new Date().toLocaleDateString("en-IN"),
        Amount_Received: payAmount,
        Payment_Method: payMethod,
        Note: payNote,
      };

      const res = await (recordPaymentAction as any)({
        data: {
          payment,
          invoiceRowIndex: sheetRowIndex,
          newStatus,
          newAmountReceived,
          newBalanceDue,
        }
      });

      if (res && res.success === false) {
        throw new Error(res.error || "Failed to save to sheet");
      }

      // Optimistically update local state
      setInvoices(prev => prev.map(inv => 
        inv.invoiceNo === payingInvoice.invoiceNo 
          ? { ...inv, paymentStatus: newStatus, amountReceived: newAmountReceived, balanceDue: newBalanceDue }
          : inv
      ));

      setPayingInvoice(null);
      // Optional: background refresh to ensure sync
      setTimeout(loadInvoices, 1000);
    } catch (err) {
      console.error("Failed to record payment:", err);
      alert("Failed to record payment. Please check your connection and try again.");
    } finally {
      setIsRecording(false);
    }
  };


  return (
    <main className="min-h-screen bg-[#fdf6e3] pb-20">
      <TopNav />
      <div className="max-w-5xl mx-auto px-4 pt-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#4a3728]">Invoice History</h1>
            <p className="text-[#8b6d4d]">View and manage all your generated bills</p>
          </div>
          <button
            onClick={loadInvoices}
            disabled={loading}
            className="p-2 rounded-xl bg-white border-2 border-[#d4bc8d]/20 text-[#8b6d4d] hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const totalSales = filtered.reduce((acc, inv) => acc + inv.netTotal, 0);
            const totalReceived = filtered.reduce((acc, inv) => acc + inv.amountReceived, 0);
            const totalOutstanding = filtered.reduce((acc, inv) => acc + inv.balanceDue, 0);

            return (
              <>
                <div className="bg-white rounded-2xl p-5 border-2 border-orange-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <FileText className="w-12 h-12 text-orange-600" />
                  </div>
                  <p className="text-xs font-bold text-[#8b6d4d] uppercase tracking-wider">Total Sales</p>
                  <p className="text-2xl font-black text-[#4a3728] mt-1">₹ {fmt(totalSales)}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border-2 border-green-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <p className="text-xs font-bold text-[#8b6d4d] uppercase tracking-wider">Total Received</p>
                  <p className="text-2xl font-black text-green-700 mt-1">₹ {fmt(totalReceived)}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border-2 border-red-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <p className="text-xs font-bold text-[#8b6d4d] uppercase tracking-wider">Outstanding</p>
                  <p className="text-2xl font-black text-red-600 mt-1">₹ {fmt(totalOutstanding)}</p>
                </div>
              </>
            );
          })()}
        </div>

        {loaded && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b6d4d]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer or invoice number..."
                className="w-full border-2 border-[#d4bc8d]/20 rounded-xl pl-10 pr-4 py-2.5 bg-white focus:border-[#c0421b] outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["All", "Unpaid", "Partial", "Paid"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    statusFilter === f
                      ? "bg-[#c0421b] text-white border-[#c0421b]"
                      : "bg-white text-[#8b6d4d] border-[#d4bc8d]/20 hover:border-[#c0421b]/40"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {loaded && filtered.length === 0 && (
          <div className="text-center py-16 text-[#8b6d4d]">
            <p className="text-lg font-bold">No invoices found</p>
          </div>
        )}

        {loaded && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((inv) => {
              const sc = STATUS_CONFIG[inv.paymentStatus];
              const Icon = sc.icon;
              const isExpanded = expandedId === inv.invoiceNo;
              const canPay = inv.paymentStatus !== "Paid";
              const company = detectCompany(inv);
              let items: any[] = [];
              try { items = JSON.parse(inv.itemsJson || "[]"); } catch {}

              return (
                <div key={inv.invoiceNo} className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${sc.border}`}>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${sc.bg} shrink-0`}><Icon className={`w-4 h-4 ${sc.color}`} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-[#4a3728] truncate">{inv.customerName}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>{inv.paymentStatus}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${company.color}`}>{company.label}</span>
                      </div>
                      <p className="text-xs text-[#8b6d4d]">#{inv.invoiceNo} · {inv.date}</p>
                    </div>
                    <div className="text-right shrink-0 px-2">
                      <p className="text-base font-black text-[#4a3728]">₹ {fmt(inv.netTotal)}</p>
                      {inv.paymentStatus !== "Paid" && <p className="text-[10px] text-red-500 font-bold">Due: ₹ {fmt(inv.balanceDue)}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDownloadPDF(inv)}
                        disabled={!!generatingId}
                        className="p-2 rounded-xl border-2 border-[#d4bc8d]/20 text-[#8b6d4d] hover:text-[#c0421b] transition-all"
                      >
                        {generatingId === inv.invoiceNo ? <div className="w-3.5 h-3.5 border-2 border-[#c0421b] border-t-transparent rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      </button>
                      {canPay && (
                        <button onClick={() => openPayDialog(inv)} className="bg-[#c0421b] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#a03616]">
                          Pay
                        </button>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : inv.invoiceNo)} className="p-2 rounded-xl border-2 border-[#d4bc8d]/20">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#d4bc8d]/10 p-4 space-y-4 bg-[#fdfcfb]">
                      <div className="grid grid-cols-3 gap-2">
                         <div className="bg-white p-3 rounded-xl border border-[#d4bc8d]/10">
                            <p className="text-[10px] text-[#8b6d4d] font-bold uppercase">Subtotal</p>
                            <p className="text-sm font-bold">₹ {fmt(inv.subTotal)}</p>
                         </div>
                         <div className="bg-white p-3 rounded-xl border border-[#d4bc8d]/10">
                            <p className="text-[10px] text-[#8b6d4d] font-bold uppercase">Tax</p>
                            <p className="text-sm font-bold">₹ {fmt(inv.taxAmount)}</p>
                         </div>
                         <div className="bg-white p-3 rounded-xl border border-[#d4bc8d]/10">
                            <p className="text-[10px] text-[#8b6d4d] font-bold uppercase">Balance</p>
                            <p className="text-sm font-bold text-red-600">₹ {fmt(inv.balanceDue)}</p>
                         </div>
                      </div>
                      {items.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-[#d4bc8d]/10 bg-white">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left">Item</th>
                                <th className="px-3 py-2 text-center">Qty</th>
                                <th className="px-3 py-2 text-right">Rate</th>
                                <th className="px-3 py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {items.map((item: any, i: number) => (
                                <tr key={i}>
                                  <td className="px-3 py-2 font-medium">{item.name}</td>
                                  <td className="px-3 py-2 text-center">{item.qty} {item.unit}</td>
                                  <td className="px-3 py-2 text-right">{fmt(item.rate)}</td>
                                  <td className="px-3 py-2 text-right font-bold">{fmt(item.qty * item.rate)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {payingInvoice && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-[#4a3728]">Record Payment</h2>
              <button onClick={() => setPayingInvoice(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-[#fdfcfb] p-4 rounded-xl border border-[#d4bc8d]/20 space-y-1">
              <p className="text-sm font-bold">{payingInvoice.customerName}</p>
              <div className="flex justify-between text-xs">
                 <span className="text-[#8b6d4d]">Total: ₹ {fmt(payingInvoice.netTotal)}</span>
                 <span className="text-red-500 font-bold">Due: ₹ {fmt(payingInvoice.balanceDue)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Amount to Receive (₹)</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => {
                  const val = +e.target.value;
                  const max = Number(payingInvoice.balanceDue.toFixed(2));
                  setPayAmount(Math.min(val, max));
                }}
                className="w-full border-2 border-[#d4bc8d]/20 rounded-xl px-4 py-2.5 focus:border-[#c0421b] outline-none font-black text-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["Cash", "UPI", "NEFT", "Cheque"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${payMethod === m ? "bg-[#c0421b] text-white border-[#c0421b]" : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              placeholder="Note (optional)"
              value={payNote}
              onChange={e => setPayNote(e.target.value)}
              className="w-full border-2 border-[#d4bc8d]/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#c0421b]"
            />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPayingInvoice(null)} className="flex-1 py-3 font-bold text-gray-500">Cancel</button>
              <button
                onClick={handleRecordPayment}
                disabled={isRecording || payAmount <= 0}
                className="flex-[2] bg-[#c0421b] text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {isRecording ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {printingInv && (
          <div ref={pdfTemplateRef}>
            {(() => {
              const company = detectCompany(printingInv);
              const profile = companies.find(c => c.name.toLowerCase().includes(company.label.toLowerCase())) || companies[0];
              const parsedData = JSON.parse(printingInv.itemsJson || "[]");
              const isBundled = !Array.isArray(parsedData) && parsedData.isBundled;
              const rows = Array.isArray(parsedData) ? parsedData : (parsedData.items || []);
              
              // Extract transport with deep fallback
              const transport: TransportHeader = {
                lrNo: parsedData.transport?.lrNo || "—",
                lrDate: parsedData.transport?.lrDate || "—",
                orderNo: parsedData.transport?.orderNo || "—",
                orderDate: parsedData.transport?.orderDate || "—",
                despatchedThrough: parsedData.transport?.despatchedThrough || "—",
                destination: parsedData.transport?.destination || "—",
                vehicleNo: parsedData.transport?.vehicleNo || "—",
                termsOfDelivery: parsedData.transport?.termsOfDelivery || "—",
              };

              const savedHeader = Array.isArray(parsedData) ? null : parsedData.headerInfo;
              const taxable = printingInv.subTotal - printingInv.discount;
              const isInter = printingInv.customerGstin && !printingInv.customerGstin.startsWith("33");
              const cgst = isInter ? 0 : config.cgstRate;
              const sgst = isInter ? 0 : config.sgstRate;
              const igst = isInter ? config.igstRate : 0;
              const cgstAmt = (taxable * cgst) / 100;
              const sgstAmt = (taxable * sgst) / 100;
              const igstAmt = (taxable * igst) / 100;

              return company.label === "Jayakavi" ? (
                <JayakaviTemplate 
                  profile={profile} 
                  header={{ 
                    invoiceNo: printingInv.invoiceNo, 
                    date: printingInv.date, 
                    customerName: printingInv.customerName, 
                    customerAddress: savedHeader?.customerAddress || "—", 
                    customerGstin: printingInv.customerGstin || "—",
                    transport: transport.despatchedThrough || "—"
                  }} 
                  transport={transport} 
                  rows={rows} 
                  subtotal={printingInv.subTotal} 
                  discountAmt={printingInv.discount} 
                  handling={printingInv.packingCharges} 
                  insurance={printingInv.insurance} 
                  freight={printingInv.freight} 
                  taxType={isInter ? "Inter-state" : "Intra-state"} 
                  cgst={cgst} 
                  sgst={sgst} 
                  igst={igst} 
                  cgstAmt={cgstAmt} 
                  sgstAmt={sgstAmt} 
                  igstAmt={igstAmt} 
                  taxAmount={printingInv.taxAmount} 
                  taxable={taxable} 
                  grandTotal={printingInv.netTotal} 
                />
              ) : (
                <ThangakaviyaTemplate 
                  profile={profile} 
                  header={{ 
                    invoiceNo: printingInv.invoiceNo, 
                    date: printingInv.date, 
                    customerName: printingInv.customerName, 
                    customerAddress: savedHeader?.customerAddress || "—", 
                    customerGstin: printingInv.customerGstin || "—",
                    transport: transport.despatchedThrough || "—"
                  }} 
                  transport={transport} 
                  rows={rows} 
                  subtotal={printingInv.subTotal} 
                  discountAmt={printingInv.discount} 
                  discount={0} 
                  handling={printingInv.packingCharges} 
                  insurance={printingInv.insurance} 
                  freight={printingInv.freight} 
                  taxType={isInter ? "Inter-state" : "Intra-state"} 
                  cgst={cgst} 
                  sgst={sgst} 
                  igst={igst} 
                  cgstAmt={cgstAmt} 
                  sgstAmt={sgstAmt} 
                  igstAmt={igstAmt} 
                  taxAmount={printingInv.taxAmount} 
                  taxable={taxable} 
                  grandTotal={printingInv.netTotal} 
                />
              );
            })()}
          </div>
        )}
      </div>
    </main>
  );
}
