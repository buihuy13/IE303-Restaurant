"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { mockCartItems } from "@/constants";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: mockCartItems,
      setItems: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
);
