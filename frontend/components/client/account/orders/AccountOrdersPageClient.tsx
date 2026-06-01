"use client";

import { AccountOrdersPageView } from "@/components/client/account/orders/AccountOrdersPageView";
import { OrdersLoading } from "@/components/client/account/orders/OrdersLoading";
import { useOrdersNotificationHydrate } from "@/lib/hooks/useOrdersNotificationHydrate";
import { useAccountOrdersList } from "@/hooks/client/account/useAccountOrdersList";
import { useMounted } from "@/hooks/common/useMounted";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AccountOrdersPageClient() {
    const { user, loading: authLoading } = useAuthStore();
    const mounted = useMounted();

    useOrdersNotificationHydrate(mounted && !!user?.id && !authLoading);
    const { orders, loading } = useAccountOrdersList({
        userId: user?.id ?? null,
        enabled: mounted && !!user?.id && !authLoading,
    });

    if (!mounted || authLoading || loading) {
        return <OrdersLoading />;
    }

    return <AccountOrdersPageView orders={orders} />;
}

