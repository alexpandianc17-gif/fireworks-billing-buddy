/**
 * ThangakaviyaTemplate — Professional GST Tax Invoice for Sri Thangakaviya Fireworks
 * Matches the classic box-grid layout from the client's sample bill.
 */
import type { CompanyProfile, TransportHeader } from "@/types/billing";
import { amountInWords } from "@/lib/numberToWords";

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

interface Props {
  profile: CompanyProfile;
  header: {
    invoiceNo: string;
    date: string;
    customerName: string;
    customerAddress: string;
    customerGstin: string;
    transport: string;
  };
  transport: TransportHeader;
  rows: Row[];
  subtotal: number;
  discountAmt: number;
  discount: number;
  handling: number;
  mahamai: number;
  insurance: number;
  freight: number;
  taxType: "Intra-state" | "Inter-state";
  cgst: number;
  sgst: number;
  igst: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  taxAmount: number;
  taxable: number;
  grandTotal: number;
}

function fmt(n: number) {
  const r = Math.round(n * 100) / 100;
  return r.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const b = "1px solid black";

export function ThangakaviyaTemplate({
  profile, header, transport, rows, subtotal, discountAmt, discount,
  handling, mahamai, insurance, freight,
  taxType, cgst, sgst, igst, cgstAmt, sgstAmt, igstAmt,
  taxAmount, taxable, grandTotal,
}: Props) {
  const validRows = rows.filter(r => r.name && r.qty > 0);
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);
  const totalCases = validRows.reduce((s, r) => s + r.cases, 0);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        color: "#000",
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        padding: "6mm",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", border: b, padding: "4px" }}>
        <div style={{ fontSize: "8px", textAlign: "left", float: "left" }}>
          GSTIN : {profile.gstin}
        </div>
        <div style={{ clear: "none" }}>
          <div style={{ fontWeight: "bold", fontSize: "18px", letterSpacing: "1px", textTransform: "uppercase" }}>
            {profile.name}
          </div>
          <div style={{ fontSize: "9px", whiteSpace: "pre-line" }}>{profile.address}</div>
          <div style={{ fontWeight: "bold", fontSize: "13px", marginTop: "3px", letterSpacing: "2px" }}>
            TAX INVOICE
          </div>
        </div>
      </div>

      {/* Invoice No + Date */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "3px", width: "15%", fontSize: "9px" }}>Invoice No. :</td>
            <td style={{ border: b, padding: "3px", width: "35%", fontWeight: "bold" }}>{header.invoiceNo}</td>
            <td style={{ border: b, padding: "3px", width: "10%", fontSize: "9px" }}>Date :</td>
            <td style={{ border: b, padding: "3px", width: "40%", fontWeight: "bold" }}>
              {header.date ? new Date(header.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : ""}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Consignee + LR/Order boxes */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "4px", width: "55%", verticalAlign: "top" }}>
              <div style={{ fontSize: "9px", marginBottom: "2px" }}>NAME AND ADDRESS OF CONSIGNEE :</div>
              <div style={{ fontWeight: "bold", fontSize: "10px" }}>{header.customerName}</div>
              <div style={{ whiteSpace: "pre-line", fontSize: "9px" }}>{header.customerAddress}</div>
            </td>
            <td style={{ border: b, padding: "0", width: "45%", verticalAlign: "top" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ border: b, padding: "3px", fontWeight: "bold", fontSize: "9px", textAlign: "center" }}>L.R.No.</td>
                    <td style={{ border: b, padding: "3px", fontWeight: "bold", fontSize: "9px", textAlign: "center" }}>DATE</td>
                    <td style={{ border: b, padding: "3px", fontWeight: "bold", fontSize: "9px", textAlign: "center" }}>TOTAL QTY. CASES</td>
                  </tr>
                  <tr style={{ height: "18px" }}>
                    <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{transport.lrNo}</td>
                    <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{transport.lrDate}</td>
                    <td style={{ border: b, padding: "3px", fontSize: "9px", textAlign: "center" }}>{totalCases || ""}</td>
                  </tr>
                  <tr>
                    <td style={{ border: b, padding: "3px", fontWeight: "bold", fontSize: "9px", textAlign: "center" }}>ORDER NUMBER</td>
                    <td style={{ border: b, padding: "3px", fontWeight: "bold", fontSize: "9px", textAlign: "center" }}>DATE</td>
                    <td style={{ border: b, padding: "3px", fontWeight: "bold", fontSize: "9px", textAlign: "center" }}>THROUGH</td>
                  </tr>
                  <tr style={{ height: "18px" }}>
                    <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{transport.orderNo}</td>
                    <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{transport.orderDate}</td>
                    <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{transport.despatchedThrough}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* GST No + HSN Code row */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "3px", width: "50%", fontSize: "9px" }}>
              GST No. : {header.customerGstin}
            </td>
            <td style={{ border: b, padding: "3px", width: "50%", textAlign: "right", fontWeight: "bold", fontSize: "9px" }}>
              HSN Code : 3604 FIREWORKS
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <thead>
          <tr style={{ backgroundColor: "#e0e0e0" }}>
            <th style={{ border: b, padding: "3px", textAlign: "center", fontSize: "9px", width: "5%" }}>Sl. No.</th>
            <th style={{ border: b, padding: "3px", textAlign: "center", fontSize: "9px", width: "7%" }}>No. of Cases</th>
            <th style={{ border: b, padding: "3px", fontSize: "9px", width: "30%" }}>Description of Goods</th>
            <th style={{ border: b, padding: "3px", fontSize: "9px", width: "10%" }}>Packing</th>
            <th style={{ border: b, padding: "3px", textAlign: "center", fontSize: "9px", width: "10%" }}>Quantity</th>
            <th style={{ border: b, padding: "3px", width: "12%" }}>
              <div style={{ textAlign: "center", fontSize: "9px" }}>Rate</div>
              <div style={{ display: "flex", fontSize: "8px" }}>
                <span style={{ flex: 1, textAlign: "center" }}>Rs</span>
                <span style={{ flex: 1, textAlign: "center" }}>Ps</span>
              </div>
            </th>
            <th style={{ border: b, padding: "3px", textAlign: "center", fontSize: "9px", width: "8%" }}>Unit</th>
            <th style={{ border: b, padding: "3px", width: "13%" }}>
              <div style={{ textAlign: "center", fontSize: "9px" }}>Amount</div>
              <div style={{ display: "flex", fontSize: "8px" }}>
                <span style={{ flex: 1, textAlign: "center" }}>Rs</span>
                <span style={{ flex: 1, textAlign: "center" }}>Ps</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {validRows.map((r, i) => (
            <tr key={r.id} style={{ height: "24px" }}>
              <td style={{ borderLeft: b, borderBottom: b, padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>{i + 1}</td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>{r.cases || ""}</td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "3px", fontWeight: "bold", fontSize: "9px", verticalAlign: "middle" }}>{r.name}</td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "3px", fontSize: "9px", verticalAlign: "middle" }}>{r.packing}</td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>
                {r.qty} {r.unit}
              </td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "3px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", fontSize: "9px" }}>
                  <span style={{ flex: 1, textAlign: "right", paddingRight: "2px" }}>{Math.floor(r.rate)}</span>
                  <span style={{ width: "20px", borderLeft: "1px solid #ccc", textAlign: "center" }}>{(r.rate % 1).toFixed(2).split(".")[1]}</span>
                </div>
              </td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>{r.unit}</td>
              <td style={{ borderLeft: b, borderRight: b, borderBottom: b, padding: "3px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", fontSize: "9px", fontWeight: "bold" }}>
                  <span style={{ flex: 1, textAlign: "right", paddingRight: "2px" }}>{Math.floor(r.qty * r.rate)}</span>
                  <span style={{ width: "25px", borderLeft: "1px solid #ccc", textAlign: "center" }}>{((r.qty * r.rate) % 1).toFixed(2).split(".")[1]}</span>
                </div>
              </td>
            </tr>
          ))}
          {/* Empty rows */}
          {Array.from({ length: Math.max(0, 10 - validRows.length) }).map((_, i) => (
            <tr key={`e-${i}`} style={{ height: "20px" }}>
              {Array.from({ length: 8 }).map((_, j) => (
                <td key={j} style={{ border: b, padding: "3px" }}>&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Summary Boxes */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px", backgroundColor: "#e0e0e0" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Goods Value</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Discount %</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Discount</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Sub Total</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Handling &amp; Forwarding</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Mahamai</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Insurance</td>
          </tr>
          <tr style={{ backgroundColor: "#fff" }}>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>Rs. {fmt(subtotal)}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{discount > 0 ? `${discount}%` : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>Rs. {discount > 0 ? fmt(discountAmt) : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>Rs. {fmt(subtotal - discountAmt)}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>Rs. {handling > 0 ? fmt(handling) : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>Rs. {mahamai > 0 ? fmt(mahamai) : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>Rs. {insurance > 0 ? fmt(insurance) : ""}</td>
          </tr>
          <tr>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Taxable Value</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>SGST @ {sgst}%</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>CGST @ {cgst}%</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>IGST @ {igst}%</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Total</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Freight</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>Round Off</td>
          </tr>
          <tr style={{ backgroundColor: "#fff" }}>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>Rs. {fmt(taxable)}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{taxType === "Intra-state" ? `Rs. ${fmt(sgstAmt)}` : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{taxType === "Intra-state" ? `Rs. ${fmt(cgstAmt)}` : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{taxType === "Inter-state" ? `Rs. ${fmt(igstAmt)}` : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px", fontWeight: "bold" }}>Rs. {fmt(grandTotal)}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{freight > 0 ? `Rs. ${fmt(freight)}` : ""}</td>
            <td style={{ border: b, padding: "3px", fontSize: "9px" }}>{Math.abs(roundOff) > 0.001 ? fmt(roundOff) : ""}</td>
          </tr>
        </tbody>
      </table>

      {/* Rupees + Grand Total */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "4px", width: "70%", fontSize: "9px" }}>
              <span style={{ fontWeight: "bold" }}>Rupees : </span>
              <span>{amountInWords(finalTotal)}</span>
            </td>
            <td style={{ border: b, padding: "4px", width: "15%", fontWeight: "bold", fontSize: "9px", backgroundColor: "#e0e0e0" }}>
              Grand Total
            </td>
            <td style={{ border: b, padding: "4px", width: "15%", fontWeight: "bold", fontSize: "10px", textAlign: "right" }}>
              Rs. {fmt(finalTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* NOTE + Signatory */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "4px", width: "65%", verticalAlign: "top" }}>
              <div style={{ fontWeight: "bold", fontSize: "9px", marginBottom: "2px" }}>NOTE :</div>
              <div style={{ fontSize: "7.5px", lineHeight: "1.5" }}>
                1. We are not responsible for any loss, damage, shortage or pilferge during transit. In case of any such loss, the buyers have to obtain proper certificates from Carriers within 21 days from the date of Invoice and forward the same to us to enable to lodge claim with the Insurance Company.
              </div>
              <div style={{ fontSize: "7.5px", marginTop: "2px" }}>2. All disputes are subject to SIVAKASI Jurisdiction.</div>
            </td>
            <td style={{ border: b, padding: "4px", width: "35%", verticalAlign: "top", fontSize: "8px" }}>
              Certified that the Particulars given above are true and correct.
            </td>
          </tr>
        </tbody>
      </table>

      {/* Depot + Terms + Signatory */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "4px", width: "55%", verticalAlign: "top" }}>
              <div style={{ fontSize: "9px" }}>Depot At : VARAGANOOR Village</div>
              <div style={{ fontSize: "9px" }}>Transporation Mode : {transport.despatchedThrough}</div>
              <div style={{ fontSize: "9px" }}>Vechicle No : {transport.vehicleNo}</div>
              <div style={{ fontSize: "9px" }}>Date &amp; Time of Supply</div>
              <div style={{ fontWeight: "bold", fontSize: "9px", marginTop: "4px" }}>Terms &amp; Conditions</div>
              <div style={{ fontSize: "8px" }}>SUBJECT TO SIVAKASI JURISDICTION ONLY</div>
              <div style={{ fontSize: "8px" }}>Interest @ 24% per annum will be charged on bill not paid on date.</div>
            </td>
            <td style={{ border: b, padding: "4px", width: "45%", textAlign: "right", verticalAlign: "bottom" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "25px", textTransform: "uppercase" }}>
                For {profile.name},
              </div>
              <div style={{ fontSize: "9px", borderTop: "1px solid #999", paddingTop: "3px", textAlign: "center" }}>
                Authorised Agent
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ border: b, padding: "3px", textAlign: "center", fontSize: "8px", fontWeight: "bold" }}>
              E. &amp; O.E.,
            </td>
            <td style={{ border: b, padding: "3px", textAlign: "center", fontSize: "8px" }}>
              &nbsp;
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
