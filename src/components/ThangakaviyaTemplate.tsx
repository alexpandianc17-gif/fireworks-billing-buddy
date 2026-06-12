/**
 * ThangakaviyaTemplate — Professional GST Tax Invoice for Sri Thangakaviya Fireworks
 * Matches the classic box-grid layout from the client's sample bill.
 */
import type { CompanyProfile, TransportHeader } from "@/types/billing";
import { amountInWords } from "@/lib/numberToWords";

interface Row {
  id: string;
  caseText: string;
  caseQty: number;
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
  handling, insurance, freight,
  taxType, cgst, sgst, igst, cgstAmt, sgstAmt, igstAmt,
  taxAmount, taxable, grandTotal,
}: Props) {
  const validRows = rows.filter(r => r.name && r.qty > 0);
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#000",
        background: "#fff",
        width: "190mm",
        height: "auto",
        minHeight: "277mm",
        margin: "0 auto",
        padding: "0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", border: b, padding: "6px", position: "relative" }}>
        <div style={{ fontSize: "12px", position: "absolute", left: "6px", top: "6px", verticalAlign: "middle" }}>
          GSTIN : {profile.gstin}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "20px", letterSpacing: "1px", textTransform: "uppercase" }}>
            {profile.name}
          </div>
          <div style={{ fontSize: "10px", whiteSpace: "pre-line" }}>{profile.address}</div>
          <div style={{ fontWeight: "bold", fontSize: "12px", marginTop: "3px", letterSpacing: "2px" }}>
            TAX INVOICE
          </div>
        </div>
      </div>

      {/* Invoice No + Date */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "6px", width: "15%", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Invoice No. :</td>
            <td style={{ border: b, padding: "6px", width: "35%", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>{header.invoiceNo}</td>
            <td style={{ border: b, padding: "6px", width: "10%", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Date :</td>
            <td style={{ border: b, padding: "6px", width: "40%", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>
              {header.date ? new Date(header.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : ""}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Consignee + LR/Order boxes */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px", verticalAlign: "middle" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "4px", width: "55%", verticalAlign: "top" }}>
              <div style={{ fontSize: "11px", marginBottom: "2px" }}>NAME AND ADDRESS OF CONSIGNEE :</div>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>{header.customerName}</div>
              <div style={{ whiteSpace: "pre-line", fontSize: "11px" }}>{header.customerAddress}</div>
            </td>
            <td style={{ border: b, padding: "0", width: "45%", verticalAlign: "top" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ border: b, padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>L.R.No.</td>
                    <td colSpan={2} style={{ border: b, padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>DATE</td>
                  </tr>
                  <tr style={{ height: "18px" }}>
                    <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{transport.lrNo}</td>
                    <td colSpan={2} style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{transport.lrDate}</td>
                  </tr>
                  <tr>
                    <td style={{ border: b, padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>ORDER NUMBER</td>
                    <td style={{ border: b, padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>DATE</td>
                    <td style={{ border: b, padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>THROUGH</td>
                  </tr>
                  <tr style={{ height: "18px" }}>
                    <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{transport.orderNo}</td>
                    <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{transport.orderDate}</td>
                    <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{transport.despatchedThrough}</td>
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
            <td style={{ border: b, padding: "6px", width: "50%", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>
              GST No. : {header.customerGstin}
            </td>
            <td style={{ border: b, padding: "6px", width: "50%", textAlign: "center", fontWeight: "bold", fontSize: "11px", verticalAlign: "middle" }}>
              HSN Code : 3604 FIREWORKS
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <thead>
          <tr style={{ backgroundColor: "#e0e0e0" }}>
            <th style={{ border: b, padding: "6px", textAlign: "center", fontSize: "11px", width: "5%", verticalAlign: "middle" }}>Sl. No.</th>
            <th style={{ border: b, padding: "6px", textAlign: "center", fontSize: "11px", width: "7%", verticalAlign: "middle" }}>No. of Cases</th>
            <th style={{ border: b, padding: "6px", fontSize: "11px", width: "30%", textAlign: "center", verticalAlign: "middle" }}>Description of Goods</th>
            <th style={{ border: b, padding: "6px", fontSize: "11px", width: "10%", textAlign: "center", verticalAlign: "middle" }}>Packing</th>
            <th style={{ border: b, padding: "6px", textAlign: "center", fontSize: "11px", width: "10%", verticalAlign: "middle" }}>Quantity</th>
            <th style={{ border: b, padding: "6px", width: "12%", verticalAlign: "middle" }}>
              <div style={{ textAlign: "center", fontSize: "11px" }}>Rate</div>
              <div style={{ display: "flex", fontSize: "10px" }}>
                <span style={{ flex: 1, textAlign: "center" }}>Rs</span>
                <span style={{ flex: 1, textAlign: "center" }}>Ps</span>
              </div>
            </th>
            <th style={{ border: b, padding: "6px", textAlign: "center", fontSize: "11px", width: "8%", verticalAlign: "middle" }}>Unit</th>
            <th style={{ border: b, padding: "6px", width: "13%", verticalAlign: "middle" }}>
              <div style={{ textAlign: "center", fontSize: "11px" }}>Amount</div>
              <div style={{ display: "flex", fontSize: "10px" }}>
                <span style={{ flex: 1, textAlign: "center" }}>Rs</span>
                <span style={{ flex: 1, textAlign: "center" }}>Ps</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {validRows.map((r, i) => (
            <tr key={r.id} style={{ height: "24px" }}>
              <td style={{ borderLeft: b, borderBottom: b, padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{i + 1}</td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>
                <div style={{ fontWeight: "bold" }}>{r.caseText}</div>
                <div style={{ fontSize: "10px", color: "#444" }}>{r.caseQty > 0 ? `(${r.caseQty})` : ""}</div>
              </td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{r.name}</td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{r.packing}</td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>
                {r.qty} {r.unit}
              </td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "6px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", fontSize: "10px" }}>
                  <span style={{ flex: 1, textAlign: "center" }}>{Math.floor(r.rate)}</span>
                  <span style={{ flex: 1, textAlign: "center" }}>{(r.rate % 1).toFixed(2).split(".")[1]}</span>
                </div>
              </td>
              <td style={{ borderLeft: b, borderBottom: b, padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{r.unit}</td>
              <td style={{ borderLeft: b, borderRight: b, borderBottom: b, padding: "6px", verticalAlign: "middle" }}>
                <div style={{ display: "flex", fontSize: "10px", fontWeight: "bold" }}>
                  <span style={{ flex: 1, textAlign: "center" }}>{Math.floor(r.qty * r.rate)}</span>
                  <span style={{ flex: 1, textAlign: "center" }}>{((r.qty * r.rate) % 1).toFixed(2).split(".")[1]}</span>
                </div>
              </td>
            </tr>
          ))}
          {/* Empty rows */}
          {Array.from({ length: Math.max(0, 8 - validRows.length) }).map((_, i) => (
            <tr key={`e-${i}`} style={{ height: "20px" }}>
              {Array.from({ length: 8 }).map((_, j) => (
                <td key={j} style={{ border: b, padding: "6px" }}>&nbsp;</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Summary Boxes */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px", backgroundColor: "#e0e0e0" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>Goods Value</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>Discount %</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>Discount</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>Sub Total</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>Handling &amp; Forwarding</td>
            <td colSpan={2} style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>Insurance</td>
          </tr>
          <tr style={{ backgroundColor: "#fff" }}>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Rs. {fmt(subtotal)}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{discount > 0 ? `${discount}%` : ""}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Rs. {discount > 0 ? fmt(discountAmt) : ""}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Rs. {fmt(subtotal - discountAmt)}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Rs. {handling > 0 ? fmt(handling) : ""}</td>
            <td colSpan={2} style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Rs. {insurance > 0 ? fmt(insurance) : ""}</td>
          </tr>
          <tr>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>Taxable Value</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>SGST @ {sgst}%</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>CGST @ {cgst}%</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>IGST @ {igst}%</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>Total</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>Freight</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>Round Off</td>
          </tr>
          <tr style={{ backgroundColor: "#fff" }}>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Rs. {fmt(taxable)}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{taxType === "Intra-state" ? `Rs. ${fmt(sgstAmt)}` : ""}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{taxType === "Intra-state" ? `Rs. ${fmt(cgstAmt)}` : ""}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{taxType === "Inter-state" ? `Rs. ${fmt(igstAmt)}` : ""}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>Rs. {fmt(grandTotal)}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{freight > 0 ? `Rs. ${fmt(freight)}` : ""}</td>
            <td style={{ border: b, padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{Math.abs(roundOff) > 0.001 ? fmt(roundOff) : ""}</td>
          </tr>
        </tbody>
      </table>

      {/* Rupees + Grand Total */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "6px", width: "70%", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>
              <span style={{ fontWeight: "bold" }}>Rupees : </span>
              <span>{amountInWords(finalTotal)}</span>
            </td>
            <td style={{ border: b, padding: "6px", width: "15%", fontWeight: "bold", fontSize: "11px", backgroundColor: "#e0e0e0", textAlign: "center", verticalAlign: "middle" }}>
              Grand Total
            </td>
            <td style={{ border: b, padding: "6px", width: "15%", fontWeight: "bold", fontSize: "12px", textAlign: "center", verticalAlign: "middle" }}>
              Rs. {fmt(finalTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* NOTE + Signatory */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "4px", width: "65%", verticalAlign: "middle" }}>
              <div style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "2px" }}>NOTE :</div>
              <div style={{ fontSize: "9.5px", lineHeight: "1.5" }}>
                1. We are not responsible for any loss, damage, shortage or pilferge during transit. In case of any such loss, the buyers have to obtain proper certificates from Carriers within 21 days from the date of Invoice and forward the same to us to enable to lodge claim with the Insurance Company.
              </div>
              <div style={{ fontSize: "9.5px", marginTop: "2px" }}>2. All disputes are subject to SIVAKASI Jurisdiction.</div>
            </td>
            <td style={{ border: b, padding: "4px", width: "35%", verticalAlign: "top", fontSize: "10px" }}>
              Certified that the Particulars given above are true and correct.
            </td>
          </tr>
        </tbody>
      </table>

      {/* Depot + Terms + Signatory */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px", padding: "3px 3px" }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "4px", width: "55%", verticalAlign: "middle" }}>
              <div style={{ fontSize: "11px" }}>Depot At : {profile.address.split("\n")[0] || "SIVAKASI"}</div>
              <div style={{ fontSize: "11px" }}>Transporation Mode : {transport.despatchedThrough}</div>
              <div style={{ fontSize: "11px" }}>Vechicle No : {transport.vehicleNo}</div>
              <div style={{ fontSize: "11px" }}>Date &amp; Time of Supply</div>
              <div style={{ fontWeight: "bold", fontSize: "11px", marginTop: "4px" }}>Terms &amp; Conditions</div>
              <div style={{ fontSize: "10px" }}>SUBJECT TO SIVAKASI JURISDICTION ONLY</div>
              <div style={{ fontSize: "10px" }}>Interest @ 24% per annum will be charged on bill not paid on date.</div>
            </td>
            <td style={{ border: b, padding: "4px", width: "45%", textAlign: "right", verticalAlign: "middle" }}>
              <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "bold", marginBottom: "25px", textTransform: "uppercase" }}>
                For {profile.name},
              </div>
              <div style={{ fontSize: "11px", borderTop: "1px solid #999", paddingTop: "3px", textAlign: "center", verticalAlign: "middle" }}>
                Authorised Agent
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ border: b, verticalAlign: "middle", textAlign: "center", fontSize: "10px", fontWeight: "bold" }}>
              E. &amp; O.E.,
            </td>
            <td style={{ border: b, padding: "3px", textAlign: "center", fontSize: "10px" }}>
              &nbsp;
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
