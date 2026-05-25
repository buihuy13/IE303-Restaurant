"use client";

import { useEffect } from "react";

/**
 * Refetch orders when the tab becomes visible again (fallback when SSE missed events).
 */
export function useOrdersVisibilityRefresh(enabled: boolean, refresh: () => void | Promise<void>) {
    useEffect(() => {
        if (!enabled || typeof document === "undefined") {
            return;
        }

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void refresh();
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [enabled, refresh]);
}
