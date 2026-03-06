import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/types/order.type";

export function useAdminOrderStatusDraft(initialOrders: Order[]) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [statusDraftById, setStatusDraftById] = useState<Record<string, OrderStatus>>(() => {
        const entries = initialOrders.map((o) => [o.orderId, o.status] as const);
        return Object.fromEntries(entries);
    });
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setOrders(initialOrders);
        setStatusDraftById((prev) => {
            const next: Record<string, OrderStatus> = { ...prev };
            for (const o of initialOrders) next[o.orderId] = o.status;
            return next;
        });
    }, [initialOrders]);

    return {
        orders,
        setOrders,
        statusDraftById,
        setStatusDraftById,
        updatingIds,
        setUpdatingIds,
    };
}

