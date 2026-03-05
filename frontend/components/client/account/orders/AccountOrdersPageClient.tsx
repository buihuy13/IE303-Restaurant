 "use client";

import { OrdersEmptyState } from "@/components/client/Account/orders/OrdersEmptyState";
import { OrdersHeader } from "@/components/client/Account/orders/OrdersHeader";
import { OrdersList } from "@/components/client/Account/orders/OrdersList";
import { OrdersLoading } from "@/components/client/Account/orders/OrdersLoading";
import { useAccountOrdersList } from "@/hooks/client/account/useAccountOrdersList";
import { useMounted } from "@/hooks/common/useMounted";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AccountOrdersPageClient() {
    const { user, loading: authLoading } = useAuthStore();
    const mounted = useMounted();
    const { orders, isLoading } = useAccountOrdersList({
        userId: user?.id ?? null,
        enabled: mounted && !!user?.id && !authLoading,
    });

    if (!mounted || authLoading || isLoading) {
        return <OrdersLoading />;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <OrdersHeader />
            {orders.length === 0 ? <OrdersEmptyState /> : <OrdersList orders={orders} />}
        </div>
    );
}
