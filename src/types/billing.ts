export interface Product {
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

export interface Config {
  pin: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  defaultDiscount: number;
  mahamaiRate: number;
}

export interface Invoice {
  invoiceNo: string;
  date: string;
  subTotal: number;
  discount: number;
  packingCharges: number;
  freight: number;
  mahamai: number;
  insurance: number;
  taxAmount: number;
  netTotal: number;
  itemsJson: string;
}
