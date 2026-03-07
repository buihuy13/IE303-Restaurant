import { useMemo, useState } from "react";
import type { Order } from "@/types/order.type";

export function useAdminOrderSearch(orders: Order[]) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        return orders.filter(
            (order) =>
                order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [orders, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        filteredOrders,
    };
}

