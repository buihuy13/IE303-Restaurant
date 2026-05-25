"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname } from "next/navigation";

/**
 * Customer-only data sync (cart, addresses) — mirrors SSEProvider gating.
 */
export function useCustomerRouteScope() {
    const pathname = usePathname();
    const authRole = useAuthStore((state) => state.authRole);

    const isDashboardRoute =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/merchant") ||
        pathname.startsWith("/manager");

    const enableCustomerDataSync = authRole === "USER" && !isDashboardRoute;

    return { enableCustomerDataSync, isDashboardRoute, pathname };
}
