"use client";

import { useCustomerRouteScope } from "@/lib/hooks/useCustomerRouteScope";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

/**
 * Sync cart with user authentication — customer routes only (USER role, not admin/merchant).
 */
export function useCartSync() {
    const { user, isAuthenticated, accessToken, loading, isLoggingOut } = useAuthStore();
    const { enableCustomerDataSync } = useCustomerRouteScope();
    const { setUserId, fetchCart } = useCartStore();

    useEffect(() => {
        if (enableCustomerDataSync && isAuthenticated && user?.id) {
            setUserId(user.id);
            fetchCart().catch(() => {
                // Cart may not exist yet or service may be unavailable.
            });
            return;
        }

        const hasToken = !!accessToken;
        if (isLoggingOut || (!isAuthenticated && !hasToken && !loading)) {
            setUserId(null);
        }
    }, [
        enableCustomerDataSync,
        isAuthenticated,
        user?.id,
        accessToken,
        loading,
        isLoggingOut,
        fetchCart,
        setUserId,
    ]);
}
