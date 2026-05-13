import { create } from "zustand";
// Import your new Server Function!
import { fetchGoogleSheetData } from "@/server/googleSheets";

export type Company = "Jayakavi" | "Thangakaviya" | "Both";

export interface Product {
  company: string;
  name: string;
  hsn: string;
  unit: string;
}

interface BillingState {
  authed: boolean;
  isLoading: boolean;
  selectedCompany: "Jayakavi" | "Thangakaviya" | null;
  config: {
    PIN: string;
    CGST_Rate: number;
    SGST_Rate: number;
    IGST_Rate: number;
    Default_Discount: number;
  };
  products: Product[];
  setAuthed: (val: boolean) => void;
  setCompany: (c: "Jayakavi" | "Thangakaviya") => void;
  fetchData: () => Promise<void>;
  saveConfig: (c: any) => Promise<void>;
  addProduct: (p: any) => { ok: boolean; error?: string };
  deleteProduct: (id: string) => void;
}

export const useBilling = create<BillingState>((set) => ({
  authed: false,
  isLoading: true,
  selectedCompany: null,
  config: {
    PIN: "123456",
    CGST_Rate: 9,
    SGST_Rate: 9,
    IGST_Rate: 18,
    Default_Discount: 0,
  },
  products: [],
  setAuthed: (val) => set({ authed: val }),
  setCompany: (c) => set({ selectedCompany: c }),

  fetchData: async () => {
    try {
      // Call the TanStack server function directly! No fetch() needed.
      const data = await fetchGoogleSheetData();

      set((state) => ({
        config: { ...state.config, ...data.settings },
        products: data.products || [],
        isLoading: false
      }));
    } catch (error) {
      console.error("Error fetching from Server Function:", error);
      set({ isLoading: false });
    }
  },

  saveConfig: async () => { },
  addProduct: () => ({ ok: true }),
  deleteProduct: () => { },
}));