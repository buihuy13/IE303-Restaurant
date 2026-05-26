"use client";

import GlobalLoader from "@/components/ui/GlobalLoader";
import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order } from "@/types/order.type";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OrderDetailClientWrapper from "./OrderDetailClientWrapper";

const normalizeMatchKey = (value: unknown): string => {
    if (value == null) return "";
    const normalized = String(value).trim().toLowerCase().replace(/-/g, "");
    if (!normalized || normalized === "undefined" || normalized === "null") return "";
    return normalized;
};

const doesOrderMatchRouteKey = (order: Order | null | undefined, routeKey: string): boolean => {
    if (!order) return false;
    const target = normalizeMatchKey(routeKey);
    if (!target) return false;
    const orderIdKey = normalizeMatchKey(order.orderId);
    const slugKey = normalizeMatchKey(order.slug);
    const orderCodeKey = normalizeMatchKey(order.orderCode);
    return (
        (orderIdKey !== "" && orderIdKey === target) ||
        (slugKey !== "" && slugKey === target) ||
        (orderCodeKey !== "" && orderCodeKey === target)
    );
};

const logOrderDetailDebug = (label: string, payload: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "development") return;
    console.log(`[OrderDetailContainer] ${label}`, payload);
};

export default function OrderDetailPageContainer() {
    const router = useRouter();
    const routeParams = useParams<{ slug?: string | string[] }>();
    const routeSlug = Array.isArray(routeParams?.slug) ? routeParams.slug[0] : routeParams?.slug;
    const userId = useAuthStore((state) => state.user?.id ?? null);
    const authLoading = useAuthStore((state) => state.loading);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) {
            logOrderDetailDebug("Effect waiting for auth loading", {
                routeSlug,
                authLoading,
            });
            return;
        }
        if (!routeSlug) {
            logOrderDetailDebug("Effect waiting for route slug", {
                routeSlug,
            });
            return;
        }
        let cancelled = false;
        logOrderDetailDebug("Effect started", {
            routeSlug,
            authLoading,
            isAuthenticated,
            userId,
        });

        const fetchOrder = async () => {
            const routeKey = normalizeMatchKey(routeSlug);
            if (routeKey === "notfound") {
                logOrderDetailDebug("Reserved not-found route, skipping order API fetch", {
                    routeSlug,
                    routeKey,
                });
                if (!cancelled) {
                    setIsLoading(false);
                    router.replace("/orders/not-found");
                }
                return;
            }
            if (!routeKey) {
                logOrderDetailDebug("Invalid route slug, redirecting not-found", {
                    routeSlug,
                });
                if (!cancelled) {
                    setIsLoading(false);
                    router.replace("/orders/not-found");
                }
                return;
            }
            try {
                const data = await orderApi.getOrderBySlug(routeSlug);
                logOrderDetailDebug("Fetched order by route key", {
                    routeSlug,
                    fetchedOrderId: data.orderId,
                    fetchedSlug: data.slug,
                    fetchedOrderCode: data.orderCode,
                    fetchedRestaurant: data.restaurant?.name,
                    itemCount: Array.isArray(data.items) ? data.items.length : 0,
                    totalAmount: data.finalAmount ?? data.totalAmount,
                });
                if (!doesOrderMatchRouteKey(data, routeSlug)) {
                    logOrderDetailDebug("Direct fetch mismatch, switching to user-order fallback", {
                        routeSlug,
                        fetchedOrderId: data.orderId,
                        fetchedSlug: data.slug,
                        fetchedOrderCode: data.orderCode,
                    });
                    throw new Error("ORDER_ROUTE_MISMATCH");
                }
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
                            logOrderDetailDebug("Missing auth context for fallback", {
                                routeSlug,
                                routeKey,
                                userId,
                                isAuthenticated,
                                hasToken,
                            });
                            router.replace("/orders/not-found");
                            return;
                        }

                        const { orders } = await orderApi.getOrdersByUser(userId || "__self__", { size: 100 });
                        const target = routeKey;
                        const matched =
                            orders.find(
                                (o) =>
                                    (normalizeMatchKey(o.orderId) !== "" && normalizeMatchKey(o.orderId) === target) ||
                                    (normalizeMatchKey(o.slug) !== "" && normalizeMatchKey(o.slug) === target) ||
                                    (normalizeMatchKey(o.orderCode) !== "" &&
                                        normalizeMatchKey(o.orderCode) === target),
                            ) ?? null;
                        if (matched) {
                            logOrderDetailDebug("Fallback matched order", {
                                routeSlug,
                                matchedOrderId: matched.orderId,
                                matchedSlug: matched.slug,
                                matchedOrderCode: matched.orderCode,
                                matchedRestaurant: matched.restaurant?.name,
                                matchedItemCount: Array.isArray(matched.items) ? matched.items.length : 0,
                                matchedTotalAmount: matched.finalAmount ?? matched.totalAmount,
                            });
                            setOrder(matched);
                            return;
                        }
                        logOrderDetailDebug("Fallback did not find order", {
                            routeSlug,
                            routeKey,
                            totalOrdersScanned: orders.length,
                        });
                    } catch {
                        // Ignore fallback failure and continue to not-found.
                    }
                }
                if (!cancelled) {
                    logOrderDetailDebug("Redirecting to not-found after all fetch paths failed", {
                        routeSlug,
                        routeKey,
                    });
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
    }, [authLoading, isAuthenticated, routeSlug, router, userId]);

    if (isLoading) {
        return <GlobalLoader label="Loading order" sublabel="Please wait a moment" />;
    }

    if (!order) {
        return null;
    }

    return <OrderDetailClientWrapper initialOrder={order} />;
}
