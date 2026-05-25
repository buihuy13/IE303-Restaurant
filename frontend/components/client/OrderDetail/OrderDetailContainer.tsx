"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order } from "@/types/order.type";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderDetailClientWrapper from "./OrderDetailClientWrapper";

const normalizeMatchKey = (value: unknown): string => String(value ?? "").trim().toLowerCase().replace(/-/g, "");

export default function OrderDetailPageContainer({ params }: { params: { slug: string } }) {
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
                const data = await orderApi.getOrderBySlug(params.slug);
                if (!cancelled) {
                    setOrder(data);
                }
            } catch {
                // Fallback: some gateways list orders but fail direct /order/{id}.
                // Rehydrate from user history so View Details still works.
                if (!cancelled) {
                    try {
                        const hasToken =
                            typeof window !== "undefined" &&
                            (!!localStorage.getItem("accessToken") || !!localStorage.getItem("refreshToken"));
                        if (!userId && !isAuthenticated && !hasToken) {
                            router.replace("/orders/not-found");
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
                    router.replace("/orders/not-found");
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
    }, [authLoading, isAuthenticated, params.slug, router, userId]);

    if (isLoading) {
        return <GlobalLoader label="Loading order" sublabel="Please wait a moment" />;
    }

    if (!order) {
        return null;
    }

    return <OrderDetailClientWrapper initialOrder={order} />;
}
