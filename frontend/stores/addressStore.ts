"use client";

import { authApi } from "@/lib/api/authApi";
import type { Address } from "@/types";
import { create } from "zustand";

interface AddressState {
    addresses: Address[];
    userId: string | null;
    loading: boolean;
    hydrated: boolean;
    fetchAddresses: (userId: string, options?: { force?: boolean }) => Promise<void>;
    setAddresses: (addresses: Address[]) => void;
    clear: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
    addresses: [],
    userId: null,
    loading: false,
    hydrated: false,

    fetchAddresses: async (userId, options) => {
        const force = options?.force ?? false;
        const state = get();

        if (!force && state.hydrated && state.userId === userId) {
            return;
        }

        set({ loading: true, userId });

        try {
            const data = await authApi.getUserAddresses(userId);
            set({
                addresses: Array.isArray(data) ? data : [],
                hydrated: true,
                loading: false,
            });
        } catch {
            set({
                addresses: [],
                hydrated: true,
                loading: false,
            });
        }
    },

    setAddresses: (addresses) => set({ addresses, hydrated: true }),

    clear: () =>
        set({
            addresses: [],
            userId: null,
            loading: false,
            hydrated: false,
        }),
}));
