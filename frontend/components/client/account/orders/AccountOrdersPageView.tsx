 "use client";

import type { ComponentProps } from "react";
import { OrdersEmptyState } from "@/components/client/Account/orders/OrdersEmptyState";
import { OrdersHeader } from "@/components/client/Account/orders/OrdersHeader";
import { OrdersList } from "@/components/client/Account/orders/OrdersList";

type OrdersListProps = ComponentProps<typeof OrdersList>;

interface AccountOrdersPageViewProps {
    orders: OrdersListProps["orders"];
}

export function AccountOrdersPageView({ orders }: AccountOrdersPageViewProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <OrdersHeader />
            {orders.length === 0 ? <OrdersEmptyState /> : <OrdersList orders={orders} />}
        </div>
    );
}

