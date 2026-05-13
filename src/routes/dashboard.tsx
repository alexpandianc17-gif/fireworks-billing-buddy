import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Plus, Trash2, ArrowLeft, Download, FileText } from "lucide-react";
import { useBilling } from "@/store/billing";

export default function BillingPage() {
  const navigate = useNavigate();
  const { config, products, selectedCompany } = useBilling();
  const printRef = useRef<HTMLDivElement>(null);

  // 1. STATE MANAGEMENT
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNo: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerAddress: "",
    gstin: "",
    transport: "",
  });

  // Unique IDs for rows to fix the "Duplicate Key" React Error
  const [rows, setRows] = useState([
    { id: Math.random().toString(), cases: "", product: "", hsn: "3604", qty: 0, unit: "nos", rate: 0 }
  ]);

  const [adjustments, setAdjustments] = useState({
    discountPct: config.Default_Discount || 0,
    handling: 0,
    mahamai: 0,
    insurance: 0,
    freight: 0,
    taxType: "Intra-state", // or "Inter-state"
    cgstPct: config.CGST_Rate || 9,
    sgstPct: config.SGST_Rate || 9,
    igstPct: config.IGST_Rate || 18,
  });

  // 2. CALCULATIONS
  const calculateTotals = () => {
    const subtotal = rows.reduce((sum, row) => sum + (row.qty * row.rate), 0);
    const discountAmt = subtotal * (adjustments.discountPct / 100);
    const afterDiscount = subtotal - discountAmt;

    const taxableValue = afterDiscount + adjustments.handling + adjustments.mahamai + adjustments.insurance + adjustments.freight;

    let taxAmt = 0;
    if (adjustments.taxType === "Intra-state") {
      taxAmt = taxableValue * ((adjustments.cgstPct + adjustments.sgstPct) / 100);
    } else {
      taxAmt = taxableValue * (adjustments.igstPct / 100);
    }

    const rawTotal = taxableValue + taxAmt;
    const grandTotal = Math.round(rawTotal);
    const roundOff = grandTotal - rawTotal;

    return { subtotal, discountAmt, taxableValue, taxAmt, roundOff, grandTotal };
  };

  const totals = calculateTotals();

  // 3. KEYBOARD NAVIGATION & ROW MANAGEMENT
  const handleKeyDown = (e: React.KeyboardEvent, index: number, field: string) => {
    // Pressing Enter on the Rate field adds a new row automatically
    if (e.key === "Enter" && field === "rate") {
      e.preventDefault();
      if (index === rows.length - 1) addRow();
    }

    // Arrow Up/Down Navigation
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextInput = document.getElementById(`row-${index + 1}-${field}`);
      if (nextInput) nextInput.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevInput = document.getElementById(`row-${index - 1}-${field}`);
      if (prevInput) prevInput.focus();
    }
  };

  const addRow = () => {
    setRows([...rows, { id: Math.random().toString(), cases: "", product: "", hsn: "3604", qty: 0, unit: "nos", rate: 0 }]);
  };

  const removeRow = (indexToRemove: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, index) => index !== indexToRemove));
    }
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };

    // Auto-fill unit and HSN when product is selected
    if (field === "product") {
      const selectedProduct = products.find(p => p.name === value);
      if (selectedProduct) {
        newRows[index].unit = selectedProduct.unit;
        newRows[index].hsn = selectedProduct.hsn;
      }
    }
    setRows(newRows);
  };

  // 4. BULLETPROOF PDF GENERATION
  const generatePDF = async () => {
    if (!printRef.current) return;

    try {
      // Temporarily show the hidden print view
      printRef.current.style.display = "block";

      const dataUrl = await toPng(printRef.current, {
        pixelRatio: 2, // High resolution
        backgroundColor: "#ffffff", // Force standard hex white
      });

      // Hide the print view again
      printRef.current.style.display = "none";

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceDetails.invoiceNo}_${selectedCompany}.pdf`);

    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER BAR */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: "/dashboard" })} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Billing: {selectedCompany}</h1>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Generate PDF
        </button>
      </div>

      <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {/* CUSTOMER DETAILS FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2"><FileText className="w-4 h-4" /> Bill To</h3>
            <input
              type="text" placeholder="Customer Name"
              className="w-full border rounded-md p-2"
              value={invoiceDetails.customerName} onChange={e => setInvoiceDetails({ ...invoiceDetails, customerName: e.target.value })}
            />
            <textarea
              placeholder="Customer Address" className="w-full border rounded-md p-2 h-20"
              value={invoiceDetails.customerAddress} onChange={e => setInvoiceDetails({ ...invoiceDetails, customerAddress: e.target.value })}
            />
            <input
              type="text" placeholder="GSTIN" className="w-full border rounded-md p-2"
              value={invoiceDetails.gstin} onChange={e => setInvoiceDetails({ ...invoiceDetails, gstin: e.target.value })}
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Invoice Details</h3>
            <div className="flex gap-4">
              <input
                type="text" placeholder="Invoice No." className="w-1/2 border rounded-md p-2"
                value={invoiceDetails.invoiceNo} onChange={e => setInvoiceDetails({ ...invoiceDetails, invoiceNo: e.target.value })}
              />
              <input
                type="date" className="w-1/2 border rounded-md p-2"
                value={invoiceDetails.date} onChange={e => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Transport / LR Details" className="w-full border rounded-md p-2 h-20 mt-4"
              value={invoiceDetails.transport} onChange={e => setInvoiceDetails({ ...invoiceDetails, transport: e.target.value })}
            />
          </div>
        </div>

        {/* INTERACTIVE BILLING TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-amber-50 text-amber-900 uppercase font-semibold">
                <tr>
                  <th className="p-3 w-12">#</th>
                  <th className="p-3 w-24">Cases</th>
                  <th className="p-3 min-w-[200px]">Product Name</th>
                  <th className="p-3 w-24">HSN</th>
                  <th className="p-3 w-24">Qty</th>
                  <th className="p-3 w-20">Unit</th>
                  <th className="p-3 w-32">Rate (₹)</th>
                  <th className="p-3 w-32 text-right">Amount</th>
                  <th className="p-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-500">{index + 1}</td>
                    <td className="p-2">
                      <input
                        id={`row-${index}-cases`}
                        type="text" className="w-full border rounded p-1 text-center"
                        value={row.cases} onChange={e => updateRow(index, "cases", e.target.value)}
                        onKeyDown={e => handleKeyDown(e, index, "cases")}
                      />
                    </td>
                    <td className="p-2">
                      {/* Note: In a real app, use a searchable Combobox here. Using datalist for simplicity. */}
                      <input
                        id={`row-${index}-product`}
                        list="product-list"
                        className="w-full border rounded p-1"
                        placeholder="Search product..."
                        value={row.product} onChange={e => updateRow(index, "product", e.target.value)}
                        onKeyDown={e => handleKeyDown(e, index, "product")}
                      />
                      <datalist id="product-list">
                        {products.filter(p => p.company === "Both" || p.company === selectedCompany).map((p, index) => (
                          <option key={`${p.name}-${p.company || 'both'}-${index}`} value={p.name} />
                        ))}
                      </datalist>
                    </td>
                    <td className="p-2">
                      <input type="text" className="w-full border rounded p-1 text-center bg-gray-50" value={row.hsn} readOnly />
                    </td>
                    <td className="p-2">
                      <input
                        id={`row-${index}-qty`}
                        type="number" min="0" className="w-full border rounded p-1 text-right"
                        value={row.qty || ""} onChange={e => updateRow(index, "qty", parseFloat(e.target.value) || 0)}
                        onKeyDown={e => handleKeyDown(e, index, "qty")}
                      />
                    </td>
                    <td className="p-2 text-center text-gray-600">{row.unit}</td>
                    <td className="p-2">
                      <input
                        id={`row-${index}-rate`}
                        type="number" min="0" className="w-full border rounded p-1 text-right"
                        value={row.rate || ""} onChange={e => updateRow(index, "rate", parseFloat(e.target.value) || 0)}
                        onKeyDown={e => handleKeyDown(e, index, "rate")}
                      />
                    </td>
                    <td className="p-3 text-right font-medium">₹ {(row.qty * row.rate).toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <button onClick={addRow} className="flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium text-sm">
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* HIDDEN PRINT VIEW (FIXES THE OKLCH CRASH)  */}
      {/* ========================================== */}
      <div
        ref={printRef}
        style={{ display: 'none', backgroundColor: '#ffffff', color: '#000000', padding: '40px', width: '210mm', minHeight: '297mm' }}
        className="absolute left-[9999px] top-0"
      >
        {/* Invoice Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{selectedCompany === 'Jayakavi' ? 'JAYAKAVI FIRE WORKS' : 'SRI THANGAKAVIYA FIREWORKS'}</h1>
          <p style={{ margin: '5px 0' }}>TAX INVOICE</p>
        </div>

        {/* Customer & Invoice Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ width: '48%', border: '1px solid #ccc', padding: '10px' }}>
            <p><strong>Billed To:</strong></p>
            <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{invoiceDetails.customerName || 'N/A'}</p>
            <p>{invoiceDetails.customerAddress}</p>
            <p><strong>GSTIN:</strong> {invoiceDetails.gstin}</p>
          </div>
          <div style={{ width: '48%', border: '1px solid #ccc', padding: '10px' }}>
            <p><strong>Invoice No:</strong> {invoiceDetails.invoiceNo}</p>
            <p><strong>Date:</strong> {invoiceDetails.date}</p>
            <p><strong>Transport:</strong> {invoiceDetails.transport}</p>
          </div>
        </div>

        {/* Print Table (Pure HTML, no inputs) */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000', borderTop: '2px solid #000' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>S.No</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Product Description</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>HSN</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Rate</th>
              <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              row.product && ( // Only print rows that have a product selected
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{index + 1}</td>
                  <td style={{ padding: '8px' }}>{row.product} {row.cases ? `(${row.cases})` : ''}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{row.hsn}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{row.qty} {row.unit}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{row.rate.toFixed(2)}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{(row.qty * row.rate).toFixed(2)}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>

        {/* Print Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Sub Total:</span><span>₹ {totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>Discount ({adjustments.discountPct}%):</span><span>- ₹ {totals.discountAmt.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #000' }}>
              <span>Taxable Value:</span><span>₹ {totals.taxableValue.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Taxes:</span><span>₹ {totals.taxAmt.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #000', borderBottom: '2px solid #000', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
              <span>Grand Total:</span><span>₹ {totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}