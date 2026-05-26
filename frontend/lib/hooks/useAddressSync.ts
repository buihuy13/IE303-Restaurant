"use client";

import { useCustomerRouteScope } from "@/lib/hooks/useCustomerRouteScope";
import { useAddressStore } from "@/stores/addressStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

/** Single fetch of saved addresses for customer routes (header, cart, account). */
export function useAddressSync() {
    const { user, isAuthenticated, accessToken, loading, isLoggingOut } = useAuthStore();
    const { enableCustomerDataSync } = useCustomerRouteScope();
    const fetchAddresses = useAddressStore((state) => state.fetchAddresses);
    const clear = useAddressStore((state) => state.clear);

    useEffect(() => {
        if (enableCustomerDataSync && isAuthenticated && user?.id) {
            void fetchAddresses(user.id);
            return;
        }

        const hasToken = !!accessToken;
        if (isLoggingOut || (!isAuthenticated && !hasToken && !loading)) {
            clear();
        }
    }, [
        enableCustomerDataSync,
        isAuthenticated,
        user?.id,
        accessToken,
        loading,
        isLoggingOut,
        fetchAddresses,
        clear,
    ]);
}
