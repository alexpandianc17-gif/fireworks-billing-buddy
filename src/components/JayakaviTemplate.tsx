/**
 * JayakaviTemplate — Professional GST Tax Invoice for Jayakavi Fire Works
 * Matches the layout from the sample bill provided by client.
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

const cell = "border border-black px-1 py-0.5 text-[11px]";
const cellCenter = cell + " text-center";
const cellRight = cell + " text-right";

export function JayakaviTemplate({
  profile, header, transport, rows, subtotal, discountAmt,
  handling, insurance, freight,
  taxType, cgst, sgst, igst, cgstAmt, sgstAmt, igstAmt,
  taxAmount, taxable, grandTotal,
}: Props) {
  const validRows = rows.filter(r => r.name && r.qty > 0);
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);
  const isInter = taxType === "Inter-state";

  // Customer lines
  const custLines = [
    header.customerName,
    header.customerAddress,
    header.customerGstin ? `GSTIN/UIN : ${header.customerGstin}` : "",
  ].filter(Boolean);

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
      {/* Page title */}
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
        Tax Invoice
      </div>

      {/* Top grid: Seller info | Invoice details */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "4px", width: "55%", verticalAlign: "top" }}>
              <div style={{ fontWeight: "bold", fontSize: "13px", textTransform: "uppercase" }}>{profile.name}</div>
              <div style={{ whiteSpace: "pre-line", fontSize: "11px" }}>{profile.address}</div>
            </td>
            <td style={{ border: "1px solid black", padding: "0", width: "45%", verticalAlign: "top" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Invoice No.</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>{header.invoiceNo}</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Dated</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}>
                      {header.date ? new Date(header.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Delivery Note</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>&nbsp;</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Mode/Terms of Payment</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Supplier's Ref.</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>&nbsp;</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Other Reference(s)</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Buyer's Order No.</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>{transport.orderNo}</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Dated</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>{transport.orderDate}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Despatch Document No.</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>{header.invoiceNo}</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Delivery Note Date</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Despatched through</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }} colSpan={3}>{transport.despatchedThrough}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "6px 4px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Terms of Delivery</td>
                    <td style={{ border: "1px solid black", padding: "6px 4px", textAlign: "center", verticalAlign: "middle" }} colSpan={3}>{transport.termsOfDelivery}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          {/* Buyer row */}
          <tr>
            <td style={{ border: "1px solid black", padding: "6px 4px", verticalAlign: "middle" }}>
              <div style={{ fontSize: "10px", marginBottom: "2px" }}>Buyer</div>
              {custLines.map((l, i) => (
                <div key={i} style={{ fontWeight: i === 0 ? "bold" : "normal", fontSize: i === 0 ? "12px" : "11px" }}>{l}</div>
              ))}
              {header.customerGstin && (
                <div style={{ fontSize: "11px" }}>State Name : {transport.destination || "—"}, Code : 33</div>
              )}
            </td>
            <td style={{ border: "1px solid black", padding: "6px 4px", verticalAlign: "middle", textAlign: "center" }}>
              <div style={{ fontSize: "10px", marginBottom: "2px" }}>Destination</div>
              <div style={{ fontWeight: "bold" }}>{transport.destination}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ width: "4%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>Sl No.</th>
            <th style={{ width: "8%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>Marks & Nos. / Container No.</th>
            <th style={{ width: "30%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>Description of Goods</th>
            <th style={{ width: "8%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>HSN/SAC</th>
            <th style={{ width: "10%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>Quantity</th>
            <th style={{ width: "8%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>Rate</th>
            <th style={{ width: "6%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>per</th>
            <th style={{ width: "12%", border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {validRows.map((r, i) => (
            <tr key={r.id} style={{ height: "24px" }}>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{i + 1}</td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>
                <div style={{ fontWeight: "bold" }}>{r.caseText}</div>
                <div style={{ fontSize: "10px", color: "#444" }}>{r.caseQty > 0 ? `(${r.caseQty})` : ""}</div>
              </td>
              <td style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>{r.name}</td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{r.hsn}</td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{r.qty} {r.unit}</td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(r.rate)}</td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{r.unit}</td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "11px", verticalAlign: "middle" }}>{fmt(r.qty * r.rate)}</td>
            </tr>
          ))}
          {/* Tax row */}
          <tr>
            <td colSpan={6} style={{ border: "1px solid black", padding: "6px" }}>&nbsp;</td>
            <td style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>
              {isInter ? `Output IGST ${igst}%` : `CGST ${cgst}% + SGST ${sgst}%`}
            </td>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(taxAmount)}</td>
          </tr>
          {Math.abs(roundOff) > 0 && (
            <tr>
              <td colSpan={6} style={{ border: "1px solid black", padding: "6px" }}>
                <span style={{ fontSize: "11px", fontStyle: "italic" }}>Less :</span>
              </td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>Round Off</td>
              <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>
                ({roundOff > 0 ? "+" : "-"}{Math.abs(roundOff).toFixed(2)})
              </td>
            </tr>
          )}
          {/* Empty rows for appearance 
          
          {Array.from({ length: Math.max(0, 5 - validRows.length) }).map((_, i) => (
            <tr key={`empty-${i}`} style={{ height: "20px" }}>
              {Array.from({ length: 8 }).map((_, j) => (
                <td key={j} style={{ border: "1px solid black", padding: "6px" }}>&nbsp;</td>
              ))}
            </tr>
          ))}*/}
          {/* Total row */}
          <tr style={{ backgroundColor: "#f9f9f9" }}>
            <td colSpan={4} style={{ border: "1px solid black", padding: "6px", fontWeight: "bold", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Total</td>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "11px", verticalAlign: "middle" }}>
              {validRows.reduce((s, r) => s + r.qty, 0)} {validRows[0]?.unit || "nos"}
            </td>
            <td colSpan={2} style={{ border: "1px solid black", padding: "6px" }}>&nbsp;</td>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontWeight: "bold", fontSize: "12px", verticalAlign: "middle" }}>
              ₹ {fmt(finalTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "6px", width: "80%", textAlign: "center", verticalAlign: "middle" }}>
              <span style={{ fontWeight: "bold", fontSize: "11px" }}>Amount Chargeable (in words)</span>
              <div style={{ fontWeight: "bold", fontSize: "12px", marginTop: "2px" }}>{amountInWords(finalTotal)}</div>
            </td>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", verticalAlign: "middle", fontSize: "10px", fontStyle: "italic" }}>
              E. &amp; O. E
            </td>
          </tr>
        </tbody>
      </table>

      {/* HSN Tax Summary Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>HSN/SAC</th>
            <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Taxable Value</th>
            {isInter ? (
              <>
                <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Integrated Tax Rate</th>
                <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Amount</th>
              </>
            ) : (
              <>
                <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>CGST Rate</th>
                <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>CGST Amount</th>
                <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>SGST Rate</th>
                <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>SGST Amount</th>
              </>
            )}
            <th style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Total Tax Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>3604</td>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(taxable)}</td>
            {isInter ? (
              <>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{igst}%</td>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(igstAmt)}</td>
              </>
            ) : (
              <>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{cgst}%</td>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(cgstAmt)}</td>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{sgst}%</td>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(sgstAmt)}</td>
              </>
            )}
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(taxAmount)}</td>
          </tr>
          <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
            <td style={{ border: "1px solid black", padding: "6px", fontSize: "11px", textAlign: "center", verticalAlign: "middle" }}>Total</td>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(taxable)}</td>
            {isInter ? (
              <>
                <td style={{ border: "1px solid black", padding: "6px" }}></td>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(igstAmt)}</td>
              </>
            ) : (
              <>
                <td style={{ border: "1px solid black", padding: "6px" }}></td>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(cgstAmt)}</td>
                <td style={{ border: "1px solid black", padding: "6px" }}></td>
                <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(sgstAmt)}</td>
              </>
            )}
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", fontSize: "11px", verticalAlign: "middle" }}>{fmt(taxAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax amount in words */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", verticalAlign: "middle" }}>
              <span style={{ fontSize: "11px" }}>Tax Amount (in words) : </span>
              <span style={{ fontWeight: "bold", fontSize: "11px" }}>{amountInWords(taxAmount)}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bank + Declaration + Signatory */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "6px", verticalAlign: "midde", width: "50%", textAlign: "left" }}>
              <div style={{ fontSize: "10px", marginBottom: "3px", fontStyle: "italic" }}>Declaration.</div>
              <div style={{ fontSize: "10px", lineHeight: "1.4" }}>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
              {profile.bankName && (
                <div style={{ marginTop: "6px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "11px", marginBottom: "3px" }}>Company's Bank Details</div>
                  <div style={{ fontSize: "10px" }}>Bank Name : {profile.bankName}</div>
                  <div style={{ fontSize: "10px" }}>A/c. No. : {profile.accountNo}</div>
                  <div style={{ fontSize: "10px" }}>Branch &amp; IFS Code : {profile.branch} (IFS: {profile.ifsc})</div>
                </div>
              )}
            </td>
            <td style={{ border: "1px solid black", padding: "6px", textAlign: "center", verticalAlign: "middle" }}>
              <div style={{ fontSize: "11px", marginBottom: "30px", textTransform: "uppercase", fontWeight: "bold" }}>for {profile.name}</div>
              <div style={{ fontSize: "10px", borderTop: "1px solid #999", paddingTop: "3px" }}>
                Authorised Signatory
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "10px", marginTop: "6px", fontStyle: "italic" }}>
        This is a Computer Generated Invoice
      </div>
    </div>
  );
}
