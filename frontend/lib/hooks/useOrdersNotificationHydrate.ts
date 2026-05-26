"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { OrderStatus } from "@/types/order.type";
import { useCallback, useEffect, useRef } from "react";

/**
 * One-time order list hydration for notification diffing — only on order history routes.
 * Real-time updates come from SSEProvider (useSSE).
 */
export function useOrdersNotificationHydrate(enabled: boolean) {
    const { user, isAuthenticated } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const lastOrderCheckRef = useRef<Map<string, OrderStatus>>(new Map());
    const hasSyncedRef = useRef(false);

    const syncOrderNotifications = useCallback(async () => {
        if (!isAuthenticated || !user?.id) return;

        try {
            const { orders } = await orderApi.getOrdersByUser(user.id);
            const currentStatusMap = new Map<string, OrderStatus>();

            orders.forEach((order) => {
                const orderId = order.orderId;
                const currentStatus = order.status;
                currentStatusMap.set(orderId, currentStatus);

                const previousStatus = lastOrderCheckRef.current.get(orderId);
                if (previousStatus && previousStatus !== currentStatus) {
                    const restaurantName = order.restaurant?.name || "Restaurant";

                    switch (currentStatus) {
                        case OrderStatus.CONFIRMED:
                            if (previousStatus === OrderStatus.PENDING) {
                                addNotification({
                                    type: "ORDER_ACCEPTED",
                                    title: "Order Confirmed",
                                    message: `Order ${orderId} has been confirmed by the restaurant and is being prepared.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.PREPARING:
                            if (previousStatus === OrderStatus.CONFIRMED || previousStatus === OrderStatus.PENDING) {
                                addNotification({
                                    type: "ORDER_CONFIRMED",
                                    title: "Order Being Prepared",
                                    message: `Order ${orderId} is being prepared by the restaurant. Please wait a moment.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.READY:
                        case OrderStatus.DELIVERING:
                            if (
                                previousStatus === OrderStatus.PREPARING ||
                                previousStatus === OrderStatus.CONFIRMED
                            ) {
                                addNotification({
                                    type: "ORDER_CONFIRMED",
                                    title: "Order Ready for Delivery",
                                    message: `Order ${orderId} is ready. Driver will pick it up and deliver to you as soon as possible.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.COMPLETED:
                            if (
                                previousStatus === OrderStatus.READY ||
                                previousStatus === OrderStatus.DELIVERING ||
                                previousStatus === OrderStatus.PREPARING
                            ) {
                                addNotification({
                                    type: "ORDER_COMPLETED",
                                    title: "Order Delivered Successfully",
                                    message: `Order ${orderId} has been delivered. Thank you for using our service!`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        case OrderStatus.CANCELLED:
                            if (previousStatus !== OrderStatus.CANCELLED) {
                                addNotification({
                                    type: "ORDER_REJECTED",
                                    title: "Order Cancelled",
                                    message: `Order ${orderId} has been cancelled.`,
                                    orderId,
                                    restaurantName,
                                });
                            }
                            break;

                        default:
                            break;
                    }
                }
            });

            lastOrderCheckRef.current = currentStatusMap;
        } catch (error) {
            console.error("Failed to check order status:", error);
        }
    }, [isAuthenticated, user?.id, addNotification]);

    useEffect(() => {
        if (!enabled) {
            hasSyncedRef.current = false;
            lastOrderCheckRef.current.clear();
            return;
        }

        if (!isAuthenticated || !user?.id) {
            hasSyncedRef.current = false;
            lastOrderCheckRef.current.clear();
            return;
        }

        if (hasSyncedRef.current) {
            return;
        }

        hasSyncedRef.current = true;
        void syncOrderNotifications();
    }, [enabled, isAuthenticated, user?.id, syncOrderNotifications]);
}
