import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Banknote,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
} from "lucide-react";
import { useBilling } from "@/store/billing";
import { getInvoicesAction, recordPaymentAction } from "@/lib/billing-actions";
import { TopNav } from "@/components/TopNav";
import type { Invoice, Payment, PaymentStatus } from "@/types/billing";

export const Route = createFileRoute("/invoices")({
  component: InvoicesPage,
});

const STATUS_CONFIG = {
  Paid: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" },
  Partial: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  Unpaid: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" },
};

// Detect company from invoice number prefix (J = Jayakavi, T = Thangakaviya)
// Falls back to checking customerGstin pattern or just showing "Jayakavi"
function detectCompany(inv: Invoice): { label: string; color: string } {
  const no = inv.invoiceNo?.toUpperCase() || "";
  if (no.startsWith("T") || no.startsWith("TK") || no.includes("TANKA") || no.includes("TANG")) {
    return { label: "Sri Thangakaviya", color: "bg-purple-100 text-purple-700" };
  }
  return { label: "Jayakavi", color: "bg-orange-100 text-orange-700" };
}

function fmt(n: number) {
  // Round to 2 decimal places first to avoid floating point noise
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function InvoicesPage() {
  const { authed } = useBilling();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Payment dialog state
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<Payment["paymentMethod"]>("Cash");
  const [payNote, setPayNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  if (!authed) return <Navigate to="/" />;

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoicesAction();
      setInvoices((data as Invoice[]).reverse()); // newest first
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      alert("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    loadInvoices();
  }, []);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || inv.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const openPayDialog = (inv: Invoice) => {
    setPayingInvoice(inv);
    // Round balance to 2dp to avoid ugly float display
    setPayAmount(Math.round(inv.balanceDue * 100) / 100);
    setPayMethod("Cash");
    setPayNote("");
  };

  const handleRecordPayment = async () => {
    if (!payingInvoice || payAmount <= 0) return;
    setIsRecording(true);
    try {
      const newReceived = Math.round((payingInvoice.amountReceived + payAmount) * 100) / 100;
      const newBalance = Math.max(0, Math.round((payingInvoice.netTotal - newReceived) * 100) / 100);
      const newStatus: PaymentStatus = newBalance <= 0 ? "Paid" : "Partial";

      const rowIndex = invoices.findIndex((i) => i.invoiceNo === payingInvoice.invoiceNo);
      const sheetRowIndex = invoices.length - rowIndex + 1;

      const payment: Payment = {
        paymentId: `PAY-${Date.now()}`,
        invoiceNo: payingInvoice.invoiceNo,
        date: new Date().toISOString().slice(0, 10),
        amountReceived: payAmount,
        paymentMethod: payMethod,
        note: payNote,
      };

      await (recordPaymentAction as any)({
        data: {
          payment,
          invoiceRowIndex: sheetRowIndex,
          newStatus,
          newAmountReceived: newReceived,
          newBalanceDue: newBalance,
        },
      });

      setInvoices((prev) =>
        prev.map((i) =>
          i.invoiceNo === payingInvoice.invoiceNo
            ? { ...i, amountReceived: newReceived, balanceDue: newBalance, paymentStatus: newStatus }
            : i
        )
      );
      setPayingInvoice(null);
    } catch (err) {
      console.error("Failed to record payment:", err);
      alert("Failed to record payment. Please try again.");
    } finally {
      setIsRecording(false);
    }
  };

  const totalOutstanding = invoices
    .filter((i) => i.paymentStatus !== "Paid")
    .reduce((sum, i) => sum + i.balanceDue, 0);
  const totalRevenue = invoices.reduce((sum, i) => sum + i.amountReceived, 0);

  return (
    <div className="min-h-screen bg-[#fdfcfb]" style={{ scrollbarWidth: "none" }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>
      <TopNav />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#4a3728]">Invoice History</h1>
            <p className="text-[#8b6d4d] text-sm mt-1">Track payments & manage outstanding bills</p>
          </div>
          <button
            onClick={loadInvoices}
            disabled={loading}
            className="bg-white border-2 border-[#d4bc8d]/30 text-[#8b6d4d] hover:text-[#c0421b] hover:border-[#c0421b]/40 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-60 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Loading state */}
        {loading && !loaded && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#d4bc8d] border-t-[#c0421b] rounded-full animate-spin mb-4" />
            <p className="text-[#8b6d4d] font-medium">Loading invoices from Google Sheets...</p>
          </div>
        )}

        {/* Summary Cards */}
        {loaded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#d4bc8d]/20 shadow-sm">
              <p className="text-xs uppercase font-bold text-[#8b6d4d]">Total Invoices</p>
              <p className="text-4xl font-black text-[#4a3728] mt-1">{invoices.length}</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-5 border border-green-200 shadow-sm">
              <p className="text-xs uppercase font-bold text-green-600">Amount Collected</p>
              <p className="text-3xl font-black text-green-700 mt-1">₹ {fmt(totalRevenue)}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-5 border border-red-200 shadow-sm">
              <p className="text-xs uppercase font-bold text-red-500">Outstanding Balance</p>
              <p className="text-3xl font-black text-red-600 mt-1">₹ {fmt(totalOutstanding)}</p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
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

        {/* Invoice List */}
        {loaded && filtered.length === 0 && (
          <div className="text-center py-16 text-[#8b6d4d]">
            <p className="text-lg font-bold">No invoices found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        )}

        {loaded && filtered.length > 0 && (
          <div className="space-y-3 pb-8">
            {filtered.map((inv) => {
              const sc = STATUS_CONFIG[inv.paymentStatus];
              const Icon = sc.icon;
              const isExpanded = expandedId === inv.invoiceNo;
              const canPay = inv.paymentStatus !== "Paid";
              const company = detectCompany(inv);
              let items: any[] = [];
              try { items = JSON.parse(inv.itemsJson || "[]"); } catch {}

              return (
                <div
                  key={inv.invoiceNo}
                  className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${sc.border}`}
                >
                  {/* Row Header */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${sc.bg} shrink-0`}>
                      <Icon className={`w-4 h-4 ${sc.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-[#4a3728]">{inv.customerName || "—"}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>
                          {inv.paymentStatus}
                        </span>
                        {/* Company badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${company.color}`}>
                          <Building2 className="w-2.5 h-2.5" />
                          {company.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b6d4d]">#{inv.invoiceNo} · {inv.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-[#4a3728]">₹ {fmt(inv.netTotal)}</p>
                      {inv.paymentStatus === "Partial" && (
                        <p className="text-xs text-red-500 font-bold">Due: ₹ {fmt(inv.balanceDue)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Save PDF button */}
                      <button
                        onClick={() => alert(`PDF for ${inv.invoiceNo} — coming soon in Phase 3!`)}
                        className="p-2 rounded-xl border-2 border-[#d4bc8d]/20 text-[#8b6d4d] hover:text-[#c0421b] hover:border-[#c0421b]/30 hover:bg-[#c0421b]/5 transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {canPay && (
                        <button
                          onClick={() => openPayDialog(inv)}
                          className="bg-[#c0421b] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#a03616] transition-colors"
                        >
                          <Banknote className="w-3 h-3" />
                          Receive Pay
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : inv.invoiceNo)}
                        className="p-2 rounded-xl border-2 border-[#d4bc8d]/20 text-[#8b6d4d] hover:bg-gray-50"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-[#d4bc8d]/20 px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#fdfcfb] rounded-xl p-3 border border-[#d4bc8d]/10">
                          <p className="text-[10px] uppercase font-bold text-[#8b6d4d]">Subtotal</p>
                          <p className="font-bold text-[#4a3728] text-sm">₹ {fmt(inv.subTotal)}</p>
                        </div>
                        <div className="bg-[#fdfcfb] rounded-xl p-3 border border-[#d4bc8d]/10">
                          <p className="text-[10px] uppercase font-bold text-[#8b6d4d]">Tax</p>
                          <p className="font-bold text-[#4a3728] text-sm">₹ {fmt(inv.taxAmount)}</p>
                        </div>
                        <div className="bg-[#fdfcfb] rounded-xl p-3 border border-[#d4bc8d]/10">
                          <p className="text-[10px] uppercase font-bold text-[#8b6d4d]">Received</p>
                          <p className="font-bold text-green-700 text-sm">₹ {fmt(inv.amountReceived)}</p>
                        </div>
                      </div>

                      {items.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-[#8b6d4d] uppercase mb-2">Items</p>
                          <div className="overflow-x-auto rounded-xl border border-[#d4bc8d]/10">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-[#fdfcfb] text-[#8b6d4d] text-xs">
                                  <th className="text-left px-3 py-2">Product</th>
                                  <th className="text-center px-3 py-2">Qty</th>
                                  <th className="text-right px-3 py-2">Rate</th>
                                  <th className="text-right px-3 py-2">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#d4bc8d]/10">
                                {items.map((item: any, idx: number) => (
                                  <tr key={idx}>
                                    <td className="px-3 py-2 font-medium">{item.name}</td>
                                    <td className="text-center px-3 py-2 text-[#8b6d4d]">{item.qty} {item.unit}</td>
                                    <td className="text-right px-3 py-2 text-[#8b6d4d]">{Number(item.rate).toFixed(2)}</td>
                                    <td className="text-right px-3 py-2 font-bold">{(item.qty * item.rate).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Receive Payment Dialog */}
      {payingInvoice && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#4a3728]">Receive Payment</h2>
              <button onClick={() => setPayingInvoice(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Invoice summary — compact */}
            <div className="bg-[#fdfcfb] rounded-xl px-4 py-3 border border-[#d4bc8d]/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#4a3728] text-sm">{payingInvoice.customerName}</p>
                  <p className="text-[#8b6d4d] text-xs">#{payingInvoice.invoiceNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8b6d4d]">Total</p>
                  <p className="font-black text-[#4a3728]">₹ {fmt(payingInvoice.netTotal)}</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#d4bc8d]/20 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#8b6d4d]">Received: </span>
                  <span className="font-bold text-green-600">₹ {fmt(payingInvoice.amountReceived)}</span>
                </div>
                <div className="text-right">
                  <span className="text-red-500 font-bold">Due: ₹ {fmt(payingInvoice.balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-sm font-bold text-[#4a3728]">Amount Received</label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b6d4d] font-bold">₹</span>
                <input
                  type="number"
                  min={0}
                  max={payingInvoice.balanceDue}
                  value={payAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = Math.round(Math.min(+e.target.value, payingInvoice.balanceDue) * 100) / 100;
                    setPayAmount(val);
                  }}
                  className="w-full border-2 border-[#d4bc8d]/20 rounded-xl pl-8 pr-4 py-2.5 focus:border-[#c0421b] outline-none no-spinner font-bold text-[#4a3728]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-bold text-[#4a3728] mb-1.5 block">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {(["Cash", "UPI", "NEFT", "Cheque"] as Payment["paymentMethod"][]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      payMethod === m
                        ? "border-[#c0421b] bg-[#c0421b]/5 text-[#c0421b]"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-sm font-bold text-[#4a3728]">Note (optional)</label>
              <input
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="e.g. Cheque no. 12345"
                className="w-full mt-1.5 border-2 border-[#d4bc8d]/20 rounded-xl px-4 py-2 focus:border-[#c0421b] outline-none text-sm"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setPayingInvoice(null)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={isRecording || payAmount <= 0}
                className="flex-[2] bg-festive text-white py-2.5 rounded-xl font-bold shadow-festive flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] transition-all text-sm"
              >
                {isRecording ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Banknote className="w-4 h-4" /> Record Payment</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
