import { create } from "zustand";

export type Company = "Jayakavi" | "Thangakaviya" | "Both";

export interface Product {
  id: string;
  company: Company;
  name: string;
  hsn: string;
  unit: string;
}

export interface Config {
  pin: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  defaultDiscount: number;
}

interface BillingState {
  authed: boolean;
  selectedCompany: "Jayakavi" | "Thangakaviya" | null;
  config: Config;
  products: Product[];
  loading: boolean;
  setAuthed: (v: boolean) => void;
  setCompany: (c: "Jayakavi" | "Thangakaviya") => void;
  saveConfig: (c: Config) => Promise<void>;
  addProduct: (p: Omit<Product, "id" | "hsn">) => { ok: boolean; error?: string };
  deleteProduct: (id: string) => void;
}

const initialProducts: Product[] = [
  { id: "1", company: "Both", name: "Sparklers 10cm", hsn: "3604", unit: "nos" },
  { id: "2", company: "Both", name: "Sparklers 15cm", hsn: "3604", unit: "nos" },
  { id: "3", company: "Jayakavi", name: "Flower Pots Small", hsn: "3604", unit: "nos" },
  { id: "4", company: "Jayakavi", name: "Lakshmi Crackers 10's", hsn: "3604", unit: "nos" },
  { id: "5", company: "Thangakaviya", name: "Atom Bomb", hsn: "3604", unit: "nos" },
  { id: "6", company: "Thangakaviya", name: "Rocket Bomb", hsn: "3604", unit: "nos" },
  { id: "7", company: "Both", name: "Ground Chakkar", hsn: "3604", unit: "nos" },
  { id: "8", company: "Jayakavi", name: "Twinkling Star", hsn: "3604", unit: "nos" },
];

export const useBilling = create<BillingState>((set, get) => ({
  authed: false,
  selectedCompany: null,
  config: { pin: "123456", cgstRate: 9, sgstRate: 9, igstRate: 18, defaultDiscount: 0 },
  products: initialProducts,
  loading: false,
  setAuthed: (v) => set({ authed: v }),
  setCompany: (c) => set({ selectedCompany: c }),
  saveConfig: async (c) => {
    set({ loading: true });
    await new Promise((r) => setTimeout(r, 400));
    set({ config: c, loading: false });
  },
  addProduct: (p) => {
    const exists = get().products.some(
      (x) => x.name.trim().toLowerCase() === p.name.trim().toLowerCase() && x.company === p.company,
    );
    if (exists) return { ok: false, error: "Duplicate product for this company." };
    set({
      products: [
        ...get().products,
        { ...p, id: Date.now().toString(), hsn: "3604" },
      ],
    });
    return { ok: true };
  },
  deleteProduct: (id) => set({ products: get().products.filter((p) => p.id !== id) }),
}));
