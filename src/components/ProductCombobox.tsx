import { useMemo, useState, useRef, useEffect } from "react";
import type { Product } from "@/store/billing";
import { Search } from "lucide-react";

interface Props {
  products: Product[];
  value: string;
  onSelect: (p: Product) => void;
  onNameChange?: (val: string) => void;
  autoFocus?: boolean;
}

export function ProductCombobox({ products, value, onSelect, onNameChange, autoFocus }: Props) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => setQ(value), [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8),
    [products, q],
  );

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1 border rounded-md bg-background px-2">
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value);
            onNameChange?.(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) {
              e.preventDefault();
              onSelect(filtered[0]);
              setQ(filtered[0].name);
              setOpen(false);
            }
          }}
          placeholder="Search product..."
          className="w-full py-1.5 bg-transparent focus:outline-none text-sm"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-72 max-h-64 overflow-auto bg-popover border rounded-md shadow-lg">
          {filtered.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => {
                onSelect(p);
                setQ(p.name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex justify-between gap-4"
            >
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-[10px] text-muted-foreground">{p.packing}</span>
              </div>
              <span className="text-xs text-muted-foreground">{p.unit}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
