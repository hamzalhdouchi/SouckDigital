"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  nameAr?: string;
  price: number;
  image: string;
  quantity: number;
  vendorId: string;
  vendorName: string;
  vendorSlug: string;
  variant?: { color?: string; size?: string };
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  promoCode: string | null;
  discount: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyPromo: (code: string) => Promise<boolean>;
  clearCart: () => void;
  total: () => number;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discount: 0,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
          ),
        }));
      },

      applyPromo: async (code) => {
        const { validatePromo } = await import("@/lib/api/orders");
        const res = await validatePromo(code);
        if (res.valid && res.discountPercent != null) {
          set({ promoCode: res.code ?? code, discount: res.discountPercent });
          return true;
        }
        return false;
      },

      clearCart: () => set({ items: [], promoCode: null, discount: 0 }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      total: () => {
        const sub = get().subtotal();
        const disc = get().discount;
        return sub - (sub * disc) / 100;
      },

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "souk-cart" }
  )
);
