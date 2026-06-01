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
        <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
            <OrdersHeader />
            {orders.length === 0 ? <OrdersEmptyState /> : <OrdersList orders={orders} />}
        </div>
    );
}

