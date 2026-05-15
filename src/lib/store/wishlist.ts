"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number | null;
  image: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  inStock: boolean;
  freeDelivery: boolean;
  vendor: { id?: string; name: string; slug: string; artisan?: boolean; verified?: boolean };
}

interface WishlistStore {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isWished: (id: string) => boolean;
  remove: (id: string) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((s) => ({
          items: s.items.some((i) => i.id === item.id)
            ? s.items.filter((i) => i.id !== item.id)
            : [...s.items, item],
        })),
      isWished: (id) => get().items.some((i) => i.id === id),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: "souk-wishlist" }
  )
);
