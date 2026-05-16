import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Config, type Product, type Customer, type Invoice, type CompanyProfile } from "@/types/billing";
export type { Config, Product, Customer, Invoice, CompanyProfile };
export type Company = string; // Now dynamic

import { getBillingData, saveSettingsAction, saveCompanyAction, addCompanyAction, deleteCompanyAction } from "@/lib/billing-actions";

interface BillingState {
  authed: boolean;
  selectedCompany: string | null;
  config: Config;
  companies: CompanyProfile[];
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  loading: boolean;
  setAuthed: (v: boolean) => void;
  setCompany: (c: string) => void;
  saveConfig: (c: Config) => Promise<void>;
  saveCompany: (c: CompanyProfile, index: number) => Promise<void>;
  addCompany: (c: CompanyProfile) => Promise<void>;
  setProducts: (p: Product[]) => void;
  setCustomers: (c: Customer[]) => void;
  addInvoice: (i: Invoice) => void;
  syncData: () => Promise<void>;
  addProduct: (p: { company: Company; name: string; unit: string }) => { ok: boolean; error?: string };
  deleteProduct: (id: string) => Promise<void>;
  deleteCompany: (index: number) => Promise<void>;
}

export const useBilling = create<BillingState>()(
  persist(
    (set, get) => ({
      authed: false,
      selectedCompany: null,
      config: {
        pin: "123456",
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
        defaultDiscount: 0,
        mahamaiRate: 0,
      },
      companies: [],
      products: [],
      customers: [],
      invoices: [],
      loading: false,
      setAuthed: (v) => set({ authed: v }),
      setCompany: (c) => set({ selectedCompany: c }),
      saveConfig: async (c) => {
        set({ loading: true });
        try {
          await (saveSettingsAction as any)({ data: c });
          set({ config: c });
        } finally {
          set({ loading: false });
        }
      },
      saveCompany: async (c, index) => {
        set({ loading: true });
        try {
          await (saveCompanyAction as any)({ data: { company: c, rowIndex: index } });
          const companies = [...get().companies];
          companies[index] = c;
          set({ companies });
        } finally {
          set({ loading: false });
        }
      },
      addCompany: async (c) => {
        set({ loading: true });
        try {
          await (addCompanyAction as any)({ data: c });
          set({ companies: [...get().companies, c] });
        } finally {
          set({ loading: false });
        }
      },
      setProducts: (p) => set({ products: p }),
      setCustomers: (c) => set({ customers: c }),
      addInvoice: (i) => set((s) => ({ invoices: [i, ...s.invoices] })),
      syncData: async () => {
        set({ loading: true });
        try {
          const data = await getBillingData();
          set({
            config: data.config,
            products: data.products,
            customers: data.customers,
            companies: data.companies,
          });
        } catch (error) {
          console.error("Failed to sync data:", error);
        } finally {
          set({ loading: false });
        }
      },
      addProduct: (p) => {
        const products = get().products;
        if (products.some((x) => x.name === p.name && (x.company === p.company || x.company === "Both" || p.company === "Both"))) {
          return { ok: false, error: "Product already exists for this company" };
        }
        const newP: Product = {
          company: p.company,
          code: `P-${Date.now().toString().slice(-4)}`,
          name: p.name,
          hsn: "3604",
          unit: p.unit,
          packing: "",
          rateA: 0,
          rateB: 0,
        };
        // In a real app, we'd call an API here. For now, we update local state.
        // The user hasn't asked for product persistence in Sheets yet.
        set({ products: [...products, newP] });
        return { ok: true };
      },
      deleteCompany: async (index) => {
        set({ loading: true });
        try {
          await (deleteCompanyAction as any)({ data: { rowIndex: index } });
          const companies = get().companies.filter((_, i) => i !== index);
          set({ companies });
        } finally {
          set({ loading: false });
        }
      },
      deleteProduct: async (id) => {
        set({ products: get().products.filter((p) => p.code !== id) });
      },
    }),
    {
      name: "kavya-billing-storage-v2",
    },
  ),
);
