import { createServerFn } from "@tanstack/react-start";
import { fetchSheetData, appendSheetData, updateSheetData, deleteSheetRow } from "./google-sheets";
import { Config, Product, Customer, Invoice, Payment, CompanyProfile } from "@/types/billing";

async function safeFetch(range: string) {
  try {
    return await fetchSheetData(range);
  } catch (e) {
    console.error(`Error fetching range ${range}:`, e);
    return [];
  }
}

export const getBillingData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const [settings, products, customers, companies] = await Promise.all([
      safeFetch("Settings!A2:F2"),
      safeFetch("Products!A2:H"),
      safeFetch("Customers!A2:F"),
      safeFetch("Companies!A2:H"),
    ]);

    const config: Config = {
      pin: settings[0]?.[0] || "123456",
      cgstRate: Number(settings[0]?.[1] || 9),
      sgstRate: Number(settings[0]?.[2] || 9),
      igstRate: Number(settings[0]?.[3] || 18),
      defaultDiscount: Number(settings[0]?.[4] || 0),
      mahamaiRate: Number(settings[0]?.[5] || 0),
    };

    const companyList: CompanyProfile[] = (companies || []).map((row) => ({
      name: row[0] || "",
      address: row[1] || "",
      gstin: row[2] || "",
      licNo: row[3] || "",
      bankName: row[4] || "",
      accountNo: row[5] || "",
      ifsc: row[6] || "",
      branch: row[7] || "",
    }));

    const productList: Product[] = (products || []).map((row) => ({
      code: row[0] || "",
      name: row[1] || "",
      hsn: row[2] || "",
      unit: row[3] || "",
      packing: row[4] || "",
      rateA: Number(row[5] || 0),
      rateB: Number(row[6] || 0),
      company: row[7] || "Both",
    }));

    const customerList: Customer[] = (customers || []).map((row) => ({
      name: row[0] || "",
      address1: row[1] || "",
      address2: row[2] || "",
      address3: row[3] || "",
      gstin: row[4] || "",
      pan: row[5] || "",
    }));

    return { config, products: productList, customers: customerList, companies: companyList };
  } catch (err) {
    console.error("Critical error in getBillingData:", err);
    throw err;
  }
});


export const saveInvoiceAction = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const i = args?.data || args;
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
  .handler(async (args: any) => {
    const c = args?.data || args;
    const row = [c.pin, c.cgstRate, c.sgstRate, c.igstRate, c.defaultDiscount, c.mahamaiRate];
    await updateSheetData("Settings!A2:F2", [row]);
    return { success: true };
  });

export const saveCompanyAction = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const data = args?.data || args;
    const { company, rowIndex } = data;
    const row = [
      company.name, company.address, company.gstin, company.licNo,
      company.bankName, company.accountNo, company.ifsc, company.branch
    ];
    await updateSheetData(`Companies!A${rowIndex + 2}:H${rowIndex + 2}`, [row]);
    return { success: true };
  });

export const addCompanyAction = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const company = args?.data || args;
    const row = [
      company.name, company.address, company.gstin, company.licNo,
      company.bankName, company.accountNo, company.ifsc, company.branch
    ];
    await appendSheetData("Companies!A2:H", [row]);
    return { success: true };
  });

export const deleteCompanyAction = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const data = args?.data || args;
    const { rowIndex } = data;
    await deleteSheetRow("Companies", rowIndex + 1); // +1 because start index 1 is Row 2
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
  .handler(async (args: any) => {
    const data = args?.data || args;
    const payment = data?.payment;
    const rowIndex = data?.invoiceRowIndex;
    const status = data?.newStatus;
    const received = data?.newAmountReceived;
    const due = data?.newBalanceDue;

    if (!payment?.Payment_ID || !rowIndex) {
      return { 
        success: false, 
        error: `Missing data. paymentID: ${payment?.Payment_ID}. rowIndex: ${rowIndex}` 
      };
    }

    const paymentRow = [
      payment.Payment_ID,
      payment.Invoice_No,
      payment.Date,
      payment.Amount_Received,
      payment.Payment_Method,
      payment.Note || "",
    ];
    await appendSheetData("Payments!A2:F", [paymentRow]);

    const range = `Invoices!N${rowIndex}:P${rowIndex}`;
    await updateSheetData(range, [[status, received, due]]);

    return { success: true };
  });

export const addCustomerAction = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const c = args?.data || args;
    const row = [c.name, c.address1, c.address2 || "", c.address3 || "", c.gstin || "", c.pan || ""];
    await appendSheetData("Customers!A2:F", [row]);
    return { success: true };
  });
