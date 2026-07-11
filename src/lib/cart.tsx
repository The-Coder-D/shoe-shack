import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  size: string;
  unitPriceInr: number;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => void;
  update: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
  count: number;
  subtotalInr: number;
  hydrated: boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "vortex_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(() => {
    const key = (p: string, s: string) => `${p}::${s}`;
    return {
      items,
      hydrated,
      add: (item) =>
        setItems((prev) => {
          const idx = prev.findIndex((i) => key(i.productId, i.size) === key(item.productId, item.size));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
            return next;
          }
          return [...prev, item];
        }),
      update: (productId, size, qty) =>
        setItems((prev) =>
          prev
            .map((i) => (i.productId === productId && i.size === size ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        ),
      remove: (productId, size) =>
        setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size))),
      clear: () => setItems([]),
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotalInr: items.reduce((n, i) => n + i.qty * i.unitPriceInr, 0),
    };
  }, [items, hydrated]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
}