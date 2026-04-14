"use client";

import { useSSE } from "@/lib/hooks/useSSE";
import { useAuthStore } from "@/stores/useAuthStore";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface SSEProviderProps {
    children: ReactNode;
}

/**
 * SSE Provider - Manages SSE connection for order notifications
 * - Connects when user is authenticated
 * - Disconnects when user logs out
 * - Handles order accepted/rejected notifications via SSE
 */
export default function SSEProvider({ children }: SSEProviderProps) {
    const { user, isAuthenticated } = useAuthStore();
    const pathname = usePathname();

    const isDashboardRoute =
        pathname.startsWith("/admin") || pathname.startsWith("/merchant") || pathname.startsWith("/manager");
    const shouldConnect = isAuthenticated && !!user?.id && user?.role === "USER" && !isDashboardRoute;

    // Connect SSE only for customer routes to avoid unnecessary dashboard traffic.
    useSSE({
        userId: shouldConnect ? user?.id || null : null,
        isAuthenticated: shouldConnect,
    });

    return <>{children}</>;
}
