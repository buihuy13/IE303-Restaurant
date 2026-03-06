"use client";

import type { AccountOrderDisplay } from "@/hooks/client/account/useAccountOrdersList";
import { OrderListItem } from "@/components/client/Account/orders/OrderListItem";

interface OrdersListProps {
    orders: AccountOrderDisplay[];
}

export function OrdersList({ orders }: OrdersListProps) {
    if (!orders.length) return null;

    return (
        <div className="divide-y divide-gray-100">
            {orders.map((order) => (
                <OrderListItem key={order.uniqueKey} order={order} />
            ))}
        </div>
    );
}

