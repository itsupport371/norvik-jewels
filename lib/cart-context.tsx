'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'norvik-cart';

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  currency: string;
  metalKey: string;
  colorKey?: string;
  sizeKey?: string;
  price: number;
  quantity: number;
  // Price breakdown at the moment this was added — lets the bag/checkout
  // show "Item Value / Making / GST" without recomputing the pricing engine.
  // Optional because carts saved to localStorage before this field existed
  // won't have it; getCartBreakdown() below falls back gracefully for those.
  goldValue?: number;
  diamondCharge?: number;
  makingCharge?: number;
  gstAmount?: number;
};

// Splits one cart line into { itemValue (gold + diamond), making, gst } —
// per unit, not multiplied by quantity — always adding up to exactly
// `price` — for items added before this field existed (no
// makingCharge/gstAmount stored), GST is reverse-derived from the
// always-3%-flat rule in lib/pricing.ts and Making falls back to 0, so the
// numbers shown never drift from the price the shopper actually sees.
// Exported so the bag/checkout pages can show each product's OWN breakdown
// separately (client ask, Sep 2026 — with multiple products in the bag,
// each one's price/GST should be visible per item, not only as one lumped
// total for the whole cart).
export function getItemBreakdown(item: CartItem) {
  const gst = item.gstAmount ?? Math.round(item.price - item.price / 1.03);
  const making = item.makingCharge ?? 0;
  const itemValue = item.price - making - gst;
  return { itemValue, making, gst };
}

// Aggregates the whole bag into one "Price Details" breakdown (quantity-
// weighted) — the grand-total summary shown under the per-item breakdowns
// on the bag and checkout pages.
export function getCartBreakdown(cart: CartItem[]) {
  return cart.reduce(
    (acc, item) => {
      const { itemValue, making, gst } = getItemBreakdown(item);
      return {
        itemValue: acc.itemValue + itemValue * item.quantity,
        making: acc.making + making * item.quantity,
        gst: acc.gst + gst * item.quantity,
      };
    },
    { itemValue: 0, making: 0, gst: 0 }
  );
}

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  }, [cart, loaded]);

  function addToCart(item: Omit<CartItem, 'quantity'>, qty = 1) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + qty } : c
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function updateQuantity(id: string, qty: number) {
    if (qty < 1) return;
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
  }

  function clearCart() {
    setCart([]);
  }

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
