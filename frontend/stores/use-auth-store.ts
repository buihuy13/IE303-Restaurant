"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { mockUsers } from "@/constants";
import type { User } from "@/types";

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: mockUsers[0] ?? null,
      setUser: (user) => set({ user }),
      reset: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
