import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Config, type Product, type Customer, type Invoice } from "@/types/billing";
export type { Config, Product, Customer, Invoice };

import { getBillingData } from "@/lib/billing-actions";

interface BillingState {
  authed: boolean;
  selectedCompany: "Jayakavi" | "Thangakaviya" | null;
  config: Config;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  loading: boolean;
  setAuthed: (v: boolean) => void;
  setCompany: (c: "Jayakavi" | "Thangakaviya") => void;
  saveConfig: (c: Config) => Promise<void>;
  setProducts: (p: Product[]) => void;
  setCustomers: (c: Customer[]) => void;
  addInvoice: (i: Invoice) => void;
  syncData: () => Promise<void>;
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
      products: [],
      customers: [],
      invoices: [],
      loading: false,
      setAuthed: (v) => set({ authed: v }),
      setCompany: (c) => set({ selectedCompany: c }),
      saveConfig: async (c) => {
        set({ config: c });
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
          });
        } catch (error) {
          console.error("Failed to sync data:", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "kavya-billing-storage-v2",
    },
  ),
);
