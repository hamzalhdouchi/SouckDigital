"use client";

import { create } from "zustand";

interface UIStore {
  mobileMenuOpen: boolean;
  cartDrawerOpen: boolean;
  searchOpen: boolean;
  filterDrawerOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  setCartDrawerOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setFilterDrawerOpen: (v: boolean) => void;
  toggleMobileMenu: () => void;
  toggleCartDrawer: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileMenuOpen: false,
  cartDrawerOpen: false,
  searchOpen: false,
  filterDrawerOpen: false,

  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
  setCartDrawerOpen: (v) => set({ cartDrawerOpen: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),
  setFilterDrawerOpen: (v) => set({ filterDrawerOpen: v }),

  toggleMobileMenu: () =>
    set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  toggleCartDrawer: () =>
    set((s) => ({ cartDrawerOpen: !s.cartDrawerOpen })),
}));
