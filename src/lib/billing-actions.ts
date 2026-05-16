import { createServerFn } from "@tanstack/react-start";
import { fetchSheetData, appendSheetData, updateSheetData } from "./google-sheets";
import { Config, Product, Customer, Invoice, Payment } from "@/types/billing";

export const getBillingData = createServerFn({ method: "GET" }).handler(async () => {
  const [settings, products, customers] = await Promise.all([
    fetchSheetData("Settings!A2:F2"),
    fetchSheetData("Products!A2:G"),
    fetchSheetData("Customers!A2:F"),
  ]);

  const config: Config = {
    pin: settings[0]?.[0] || "123456",
    cgstRate: Number(settings[0]?.[1] || 9),
    sgstRate: Number(settings[0]?.[2] || 9),
    igstRate: Number(settings[0]?.[3] || 18),
    defaultDiscount: Number(settings[0]?.[4] || 0),
    mahamaiRate: Number(settings[0]?.[5] || 0),
  };

  const productList: Product[] = products.map((row) => ({
    code: row[0] || "",
    name: row[1] || "",
    hsn: row[2] || "",
    unit: row[3] || "",
    packing: row[4] || "",
    rateA: Number(row[5] || 0),
    rateB: Number(row[6] || 0),
  }));

  const customerList: Customer[] = customers.map((row) => ({
    name: row[0] || "",
    address1: row[1] || "",
    address2: row[2] || "",
    address3: row[3] || "",
    gstin: row[4] || "",
    pan: row[5] || "",
  }));

  return { config, products: productList, customers: customerList };
});


export const saveInvoiceAction = createServerFn({ method: "POST" })
  .handler(async (args) => {
    const i = args.data as unknown as Invoice;
    const row = [
      i.invoiceNo,
      i.date,
      i.customerName,
      i.customerGstin || "",
      i.subTotal,
      i.discount,
      i.packingCharges,
      i.freight,
      i.mahamai,
      i.insurance,
      i.taxAmount,
      i.netTotal,
      i.itemsJson,
      i.paymentStatus,
      i.amountReceived,
      i.balanceDue,
    ];
    await appendSheetData("Invoices!A2:P", [row]);
    return { success: true };
  });

export const saveSettingsAction = createServerFn({ method: "POST" })
  .handler(async (args) => {
    const c = args.data as unknown as Config;
    const row = [c.pin, c.cgstRate, c.sgstRate, c.igstRate, c.defaultDiscount, c.mahamaiRate];
    await updateSheetData("Settings!A2:F2", [row]);
    return { success: true };
  });

export const getInvoicesAction = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await fetchSheetData("Invoices!A2:P");
  const invoices: Invoice[] = rows.map((row) => ({
    invoiceNo: row[0] || "",
    date: row[1] || "",
    customerName: row[2] || "",
    customerGstin: row[3] || "",
    subTotal: Number(row[4] || 0),
    discount: Number(row[5] || 0),
    packingCharges: Number(row[6] || 0),
    freight: Number(row[7] || 0),
    mahamai: Number(row[8] || 0),
    insurance: Number(row[9] || 0),
    taxAmount: Number(row[10] || 0),
    netTotal: Number(row[11] || 0),
    itemsJson: row[12] || "[]",
    paymentStatus: (row[13] as any) || "Unpaid",
    amountReceived: Number(row[14] || 0),
    balanceDue: Number(row[15] || 0),
  }));
  return invoices;
});

export const recordPaymentAction = createServerFn({ method: "POST" })
  .handler(async (args) => {
    const { payment, invoiceRowIndex, newStatus, newAmountReceived, newBalanceDue } =
      args.data as unknown as {
        payment: Payment;
        invoiceRowIndex: number;
        newStatus: string;
        newAmountReceived: number;
        newBalanceDue: number;
      };

    // 1. Append the payment entry to the Payments sheet
    const paymentRow = [
      payment.paymentId,
      payment.invoiceNo,
      payment.date,
      payment.amountReceived,
      payment.paymentMethod,
      payment.note || "",
    ];
    await appendSheetData("Payments!A2:F", [paymentRow]);

    // 2. Update the Invoice row's status, amountReceived, balanceDue
    // invoiceRowIndex is 1-based index from the Invoices sheet (row 2 = index 2)
    const range = `Invoices!N${invoiceRowIndex}:P${invoiceRowIndex}`;
    await updateSheetData(range, [[newStatus, newAmountReceived, newBalanceDue]]);

    return { success: true };
  });
