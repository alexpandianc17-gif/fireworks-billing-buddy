/**
 * JayakaviTemplate — Professional GST Tax Invoice for Jayakavi Fire Works
 * Matches the layout from the sample bill provided by client.
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

const cell = "border border-black px-1 py-0.5 text-[9px]";
const cellCenter = cell + " text-center";
const cellRight = cell + " text-right";

export function JayakaviTemplate({
  profile, header, transport, rows, subtotal, discountAmt,
  handling, mahamai, insurance, freight,
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
        fontSize: "9px",
        color: "#000",
        background: "#fff",
        width: "210mm",
        minHeight: "297mm",
        padding: "8mm",
        boxSizing: "border-box",
      }}
    >
      {/* Page title */}
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>
        Tax Invoice
      </div>

      {/* Top grid: Seller info | Invoice details */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "4px", width: "55%", verticalAlign: "top" }}>
              <div style={{ fontWeight: "bold", fontSize: "11px", textTransform: "uppercase" }}>{profile.name}</div>
              <div style={{ whiteSpace: "pre-line", fontSize: "9px" }}>{profile.address}</div>
            </td>
            <td style={{ border: "1px solid black", padding: "0", width: "45%", verticalAlign: "top" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "3px", fontWeight: "bold", fontSize: "9px" }}>Invoice No.</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontWeight: "bold" }}>{header.invoiceNo}</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontWeight: "bold", fontSize: "9px" }}>Dated</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontWeight: "bold" }}>
                      {header.date ? new Date(header.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Delivery Note</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Mode/Terms of Payment</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Supplier's Ref.</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Other Reference(s)</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Buyer's Order No.</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>{transport.orderNo}</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Dated</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>{transport.orderDate}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Despatch Document No.</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>{header.invoiceNo}</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Delivery Note Date</td>
                    <td style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Despatched through</td>
                    <td style={{ border: "1px solid black", padding: "3px", fontWeight: "bold" }} colSpan={3}>{transport.despatchedThrough}</td>
                  </tr>
                  <tr>
                    <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Terms of Delivery</td>
                    <td style={{ border: "1px solid black", padding: "3px" }} colSpan={3}>{transport.termsOfDelivery}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          {/* Buyer row */}
          <tr>
            <td style={{ border: "1px solid black", padding: "4px", verticalAlign: "top" }}>
              <div style={{ fontSize: "8px", marginBottom: "2px" }}>Buyer</div>
              {custLines.map((l, i) => (
                <div key={i} style={{ fontWeight: i === 0 ? "bold" : "normal", fontSize: i === 0 ? "10px" : "9px" }}>{l}</div>
              ))}
              {header.customerGstin && (
                <div style={{ fontSize: "9px" }}>State Name : {transport.destination || "—"}, Code : 33</div>
              )}
            </td>
            <td style={{ border: "1px solid black", padding: "4px", verticalAlign: "top" }}>
              <div style={{ fontSize: "8px", marginBottom: "2px" }}>Destination</div>
              <div style={{ fontWeight: "bold" }}>{transport.destination}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th className={cellCenter} style={{ width: "4%", border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>Sl No.</th>
            <th className={cell} style={{ width: "8%", border: "1px solid black", padding: "3px", fontSize: "9px" }}>Marks & Nos. / Container No.</th>
            <th className={cell} style={{ width: "30%", border: "1px solid black", padding: "3px", fontSize: "9px" }}>Description of Goods</th>
            <th className={cellCenter} style={{ width: "8%", border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>HSN/SAC</th>
            <th className={cellCenter} style={{ width: "10%", border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>Quantity</th>
            <th className={cellCenter} style={{ width: "8%", border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>Rate</th>
            <th className={cellCenter} style={{ width: "6%", border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>per</th>
            <th className={cellRight} style={{ width: "12%", border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {validRows.map((r, i) => (
            <tr key={r.id} style={{ height: "24px" }}>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>{i + 1}</td>
              <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px", verticalAlign: "middle" }}>{r.code}</td>
              <td style={{ border: "1px solid black", padding: "3px", fontWeight: "bold", fontSize: "9px", verticalAlign: "middle" }}>{r.name}</td>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>{r.hsn}</td>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>{r.qty} {r.unit}</td>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px", verticalAlign: "middle" }}>{fmt(r.rate)}</td>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px", verticalAlign: "middle" }}>{r.unit}</td>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontWeight: "bold", fontSize: "9px", verticalAlign: "middle" }}>{fmt(r.qty * r.rate)}</td>
            </tr>
          ))}
          {/* Tax row */}
          <tr>
            <td colSpan={6} style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
            <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "right" }}>
              {isInter ? `Output IGST ${igst}%` : `CGST ${cgst}% + SGST ${sgst}%`}
            </td>
            <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(taxAmount)}</td>
          </tr>
          {Math.abs(roundOff) > 0 && (
            <tr>
              <td colSpan={6} style={{ border: "1px solid black", padding: "3px" }}>
                <span style={{ fontSize: "9px", fontStyle: "italic" }}>Less :</span>
              </td>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>Round Off</td>
              <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>
                ({roundOff > 0 ? "+" : "-"}{Math.abs(roundOff).toFixed(2)})
              </td>
            </tr>
          )}
          {/* Empty rows for appearance */}
          {Array.from({ length: Math.max(0, 8 - validRows.length) }).map((_, i) => (
            <tr key={`empty-${i}`} style={{ height: "20px" }}>
              {Array.from({ length: 8 }).map((_, j) => (
                <td key={j} style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
              ))}
            </tr>
          ))}
          {/* Total row */}
          <tr style={{ backgroundColor: "#f9f9f9" }}>
            <td colSpan={4} style={{ border: "1px solid black", padding: "3px", fontWeight: "bold", fontSize: "9px" }}>Total</td>
            <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontWeight: "bold", fontSize: "9px" }}>
              {validRows.reduce((s, r) => s + r.qty, 0)} {validRows[0]?.unit || "nos"}
            </td>
            <td colSpan={2} style={{ border: "1px solid black", padding: "3px" }}>&nbsp;</td>
            <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontWeight: "bold", fontSize: "10px" }}>
              ₹ {fmt(finalTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "4px", width: "80%" }}>
              <span style={{ fontWeight: "bold", fontSize: "9px" }}>Amount Chargeable (in words)</span>
              <div style={{ fontWeight: "bold", fontSize: "10px", marginTop: "2px" }}>{amountInWords(finalTotal)}</div>
            </td>
            <td style={{ border: "1px solid black", padding: "4px", textAlign: "right", fontSize: "8px", fontStyle: "italic" }}>
              E. &amp; O. E
            </td>
          </tr>
        </tbody>
      </table>

      {/* HSN Tax Summary Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>HSN/SAC</th>
            <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "right" }}>Taxable Value</th>
            {isInter ? (
              <>
                <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "center" }}>Integrated Tax Rate</th>
                <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "right" }}>Amount</th>
              </>
            ) : (
              <>
                <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "center" }}>CGST Rate</th>
                <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "right" }}>CGST Amount</th>
                <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "center" }}>SGST Rate</th>
                <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "right" }}>SGST Amount</th>
              </>
            )}
            <th style={{ border: "1px solid black", padding: "3px", fontSize: "9px", textAlign: "right" }}>Total Tax Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>3604</td>
            <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(taxable)}</td>
            {isInter ? (
              <>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>{igst}%</td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(igstAmt)}</td>
              </>
            ) : (
              <>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>{cgst}%</td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(cgstAmt)}</td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "center", fontSize: "9px" }}>{sgst}%</td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(sgstAmt)}</td>
              </>
            )}
            <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(taxAmount)}</td>
          </tr>
          <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
            <td style={{ border: "1px solid black", padding: "3px", fontSize: "9px" }}>Total</td>
            <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(taxable)}</td>
            {isInter ? (
              <>
                <td style={{ border: "1px solid black", padding: "3px" }}></td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(igstAmt)}</td>
              </>
            ) : (
              <>
                <td style={{ border: "1px solid black", padding: "3px" }}></td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(cgstAmt)}</td>
                <td style={{ border: "1px solid black", padding: "3px" }}></td>
                <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(sgstAmt)}</td>
              </>
            )}
            <td style={{ border: "1px solid black", padding: "3px", textAlign: "right", fontSize: "9px" }}>{fmt(taxAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* Tax amount in words */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "4px" }}>
              <span style={{ fontSize: "9px" }}>Tax Amount (in words) : </span>
              <span style={{ fontWeight: "bold", fontSize: "9px" }}>{amountInWords(taxAmount)}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bank + Declaration + Signatory */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "-1px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "4px", verticalAlign: "top", width: "50%" }}>
              <div style={{ fontSize: "8px", marginBottom: "3px", fontStyle: "italic" }}>Declaration.</div>
              <div style={{ fontSize: "8px", lineHeight: "1.4" }}>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
              {profile.bankName && (
                <div style={{ marginTop: "6px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "9px", marginBottom: "3px" }}>Company's Bank Details</div>
                  <div style={{ fontSize: "8px" }}>Bank Name : {profile.bankName}</div>
                  <div style={{ fontSize: "8px" }}>A/c. No. : {profile.accountNo}</div>
                  <div style={{ fontSize: "8px" }}>Branch &amp; IFS Code : {profile.branch} (IFS: {profile.ifsc})</div>
                </div>
              )}
            </td>
            <td style={{ border: "1px solid black", padding: "4px", textAlign: "right", verticalAlign: "bottom" }}>
              <div style={{ fontSize: "9px", marginBottom: "30px", textTransform: "uppercase" }}>for {profile.name}</div>
              <div style={{ fontSize: "8px", borderTop: "1px solid #999", paddingTop: "3px", textAlign: "center" }}>
                Authorised Signatory
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "8px", marginTop: "6px", fontStyle: "italic" }}>
        This is a Computer Generated Invoice
      </div>
    </div>
  );
}
