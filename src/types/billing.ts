export interface Product {
  company: string;
  code: string;
  name: string;
  hsn: string;
  unit: string;
  packing: string;
  rateA: number;
  rateB: number;
}

export interface Customer {
  name: string;
  address1: string;
  address2: string;
  address3: string;
  gstin: string;
  pan: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  gstin: string;
  licNo: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
}

export interface Config {
  pin: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  defaultDiscount: number;
  mahamaiRate: number;
}

/** Transport/despatch fields on each invoice */
export interface TransportHeader {
  lrNo: string;
  lrDate: string;
  orderNo: string;
  orderDate: string;
  despatchedThrough: string;
  destination: string;
  vehicleNo: string;
  termsOfDelivery: string;
}

export type PaymentStatus = "Unpaid" | "Partial" | "Paid";

export interface Invoice {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerGstin?: string;
  subTotal: number;
  discount: number;
  packingCharges: number;
  freight: number;
  mahamai: number;
  insurance: number;
  taxAmount: number;
  netTotal: number;
  itemsJson: string;
  paymentStatus: PaymentStatus;
  balanceDue: number;
  amountReceived: number;
}

export interface Payment {
  Payment_ID: string;
  Invoice_No: string;
  Date: string;
  Amount_Received: number;
  Payment_Method: "Cash" | "UPI" | "NEFT" | "Cheque";
  Note?: string;
}
