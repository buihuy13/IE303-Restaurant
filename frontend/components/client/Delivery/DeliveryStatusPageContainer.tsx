"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DeliveryStatusPageClientWrapper from "./DeliveryStatusPageClientWrapper";

export default function OrderStatusPage({ slug }: { slug: string }) {
    const router = useRouter();
    const userId = useAuthStore((state) => state.user?.id ?? null);
    const authLoading = useAuthStore((state) => state.loading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;

        const fetchOrder = async () => {
            try {
                const data = await orderApi.getOrderBySlug(slug, { cacheBust: true });
                if (!cancelled) {
                    setOrder(data);
                }
            } catch {
                if (!cancelled) {
                    try {
                        const hasToken =
                            typeof window !== "undefined" &&
                            (!!localStorage.getItem("accessToken") || !!localStorage.getItem("refreshToken"));
                        if (!userId && !isAuthenticated && !hasToken) {
                            router.replace("/delivery/not-found");
                            return;
                        }

                        const { orders } = await orderApi.getOrdersByUser(userId || "__self__", { size: 100 });
                        const target = normalizeMatchKey(params.slug);
                        const matched =
                            orders.find(
                                (o) =>
                                    normalizeMatchKey(o.orderId) === target ||
                                    normalizeMatchKey(o.slug) === target ||
                                    normalizeMatchKey(o.orderCode) === target,
                            ) ?? null;
                        if (matched) {
                            setOrder(matched);
                            return;
                        }
                    } catch {
                        // Ignore fallback failure and continue to not-found.
                    }
                }
                if (!cancelled) {
                    router.replace("/delivery/not-found");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void fetchOrder();
        return () => {
            cancelled = true;
        };
    }, [slug, router]);

    if (isLoading) {
        return <GlobalLoader label="Loading order tracking" sublabel="Please wait a moment" />;
    }

    if (!order) {
        return null;
    }

    return <DeliveryStatusPageClientWrapper initialOrder={order} />;
}
