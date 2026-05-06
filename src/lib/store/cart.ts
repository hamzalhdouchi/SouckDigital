"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  // MD-spec fields
  productId: string;
  productSlug?: string;
  name: string;
  nameAr?: string;
  price: number;
  image: string | null;
  vendorId: string;
  vendorName: string;
  quantity: number;
  maxStock: number;

  // Legacy fields used by existing pages
  id: string;
  slug: string;
  vendorSlug?: string;
  variant?: { color?: string; size?: string };
}

interface CartStore {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
  promoDiscountAmount: number;

  // MD-spec actions
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  applyPromo: (code: string, discountPercent?: number) => Promise<boolean> | void;
  removePromo: () => void;
  clear: () => void;

  // Legacy aliases
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  discount: number;
  subtotal: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      promoDiscountAmount: 0,
      discount: 0,

      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId || i.id === item.id
          );
          let items: CartItem[];
          if (existing) {
            items = state.items.map((i) =>
              i.productId === item.productId || i.id === item.id
                ? { ...i, quantity: Math.min(i.quantity + qty, i.maxStock) }
                : i
            );
          } else {
            items = [...state.items, { ...item, quantity: Math.min(qty, item.maxStock) }];
          }
          const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
          return {
            items,
            promoDiscountAmount: sub * state.promoDiscount / 100,
            discount: state.promoDiscount,
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const items = state.items.filter(
            (i) => i.productId !== id && i.id !== id
          );
          const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
          return { items, promoDiscountAmount: sub * state.promoDiscount / 100 };
        });
      },

      updateQty: (id, qty) => {
        if (qty === 0) {
          get().removeItem(id);
          return;
        }
        set((state) => {
          const items = state.items.map((i) =>
            i.productId === id || i.id === id
              ? { ...i, quantity: Math.min(Math.max(1, qty), i.maxStock) }
              : i
          );
          const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
          return { items, promoDiscountAmount: sub * state.promoDiscount / 100 };
        });
      },

      applyPromo: (code, discountPercent) => {
        if (discountPercent !== undefined) {
          // New spec: called with (code, percent) — sync, no API call
          set((state) => {
            const sub = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
            return {
              promoCode: code,
              promoDiscount: discountPercent,
              promoDiscountAmount: sub * discountPercent / 100,
              discount: discountPercent,
            };
          });
          return;
        }
        // Legacy: called with (code) only — async, calls promo API
        return (async () => {
          try {
            const { promoApi } = await import("@/lib/api/promo");
            const res = await promoApi.validate(code);
            if (res.valid && res.discountPercent != null) {
              set((state) => {
                const sub = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
                return {
                  promoCode: res.code ?? code,
                  promoDiscount: res.discountPercent!,
                  promoDiscountAmount: sub * res.discountPercent! / 100,
                  discount: res.discountPercent!,
                };
              });
              return true;
            }
            return false;
          } catch {
            return false;
          }
        })();
      },

      removePromo: () => set({ promoCode: null, promoDiscount: 0, promoDiscountAmount: 0, discount: 0 }),

      clear: () =>
        set({ items: [], promoCode: null, promoDiscount: 0, promoDiscountAmount: 0, discount: 0 }),

      // Legacy aliases
      updateQuantity: (id, qty) => get().updateQty(id, qty),
      clearCart: () => get().clear(),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      total: () => {
        const sub = get().subtotal();
        const fee = sub >= 300 ? 0 : 35;
        return sub - get().promoDiscountAmount + fee;
      },

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "souk-cart" }
  )
);

// ── Computed selector hooks ────────────────────────────────
export function useCartSubtotal() {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}

export function useCartDeliveryFee() {
  const subtotal = useCartSubtotal();
  return subtotal >= 300 ? 0 : 35;
}

export function useCartTotal() {
  const subtotal = useCartSubtotal();
  const fee = useCartDeliveryFee();
  const discount = useCartStore((s) => s.promoDiscountAmount);
  return subtotal - discount + fee;
}

export function useCartItemCount() {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}
