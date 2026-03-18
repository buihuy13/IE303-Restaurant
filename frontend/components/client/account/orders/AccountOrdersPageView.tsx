 "use client";

import type { ComponentProps } from "react";
import { OrdersEmptyState } from "@/components/client/account/orders/OrdersEmptyState";
import { OrdersHeader } from "@/components/client/account/orders/OrdersHeader";
import { OrdersList } from "@/components/client/account/orders/OrdersList";

type OrdersListProps = ComponentProps<typeof OrdersList>;

interface AccountOrdersPageViewProps {
    orders: OrdersListProps["orders"];
}

export function AccountOrdersPageView({ orders }: AccountOrdersPageViewProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <OrdersHeader />
            {orders.length === 0 ? <OrdersEmptyState /> : <OrdersList orders={orders} />}
        </div>
    );
}

