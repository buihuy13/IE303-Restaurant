"use client";

import { useNotificationStore } from "@/stores/useNotificationStore";

/**
 * @deprecated Order hydration moved to `useOrdersNotificationHydrate` on `/orders` and `/account/orders` only.
 * Header notifications rely on SSE (`useSSE` via SSEProvider).
 */
export function useNotifications() {
    return {
        notifications: useNotificationStore((state) => state.notifications),
        unreadCount: useNotificationStore((state) => state.unreadCount()),
    };
}
