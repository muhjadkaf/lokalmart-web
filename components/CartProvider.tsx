'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, CatalogProduct } from '@/lib/types';

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: CatalogProduct, qty?: number) => void;
  addItem: (item: CartItem) => void;
  remove: (odooId: number) => void;
  setQty: (odooId: number, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'lokalmart-cart-v2';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* keranjang rusak — mulai kosong */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage penuh — abaikan */
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue['addItem'] = (item) =>
      setItems((prev) => {
        const existing = prev.find((i) => i.odooId === item.odooId);
        if (existing) {
          return prev.map((i) => (i.odooId === item.odooId ? { ...i, qty: Math.min(i.qty + item.qty, 999) } : i));
        }
        return [...prev, { ...item, qty: Math.min(item.qty, 999) }];
      });
    const add: CartContextValue['add'] = (product, qty = 1) =>
      addItem({
        odooId: product.odooId,
        name: product.name,
        price: product.price,
        image: product.image ?? null,
        storeName: product.storeName,
        uom: product.uom,
        qty,
      });
    const remove: CartContextValue['remove'] = (odooId) => setItems((prev) => prev.filter((i) => i.odooId !== odooId));
    const setQty: CartContextValue['setQty'] = (odooId, qty) =>
      setItems((prev) => (qty <= 0 ? prev.filter((i) => i.odooId !== odooId) : prev.map((i) => (i.odooId === odooId ? { ...i, qty: Math.min(qty, 999) } : i))));
    const clear: CartContextValue['clear'] = () => setItems([]);
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    return { items, count, total, add, addItem, remove, setQty, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}
