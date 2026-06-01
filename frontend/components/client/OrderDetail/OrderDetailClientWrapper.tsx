"use client";

import { orderApi } from "@/lib/api/orderApi";
import { useOrdersVisibilityRefresh } from "@/lib/hooks/useOrdersVisibilityRefresh";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import { useState } from "react";
import toast from "react-hot-toast";
import OrderDetailClient from "./OrderDetailClient";

interface OrderDetailClientWrapperProps {
    initialOrder: Order;
}

export default function OrderDetailClientWrapper({ initialOrder }: OrderDetailClientWrapperProps) {
    const { user } = useAuthStore();
    const [order, setOrder] = useState<Order>(initialOrder);

    // Listen for order status updates via WebSocket
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            // Backend emits orderId and status at root level, not in data
            const orderId = notification.orderId || notification.data?.orderId;
            const newStatus = notification.status || notification.data?.status;

            // Only update if this is the order we're viewing
            if (!orderId || orderId !== order.orderId) {
                return;
            }

            if (!newStatus) return;

            // Show toast notification
            const statusMessages: Record<string, string> = {
                confirmed: "Order confirmed! Restaurant is preparing your order.",
                preparing: "Restaurant is preparing your order.",
                ready: "Your order is ready! Delivery is on the way.",
                completed: "Order completed! Thank you for your order.",
                cancelled: "Order has been cancelled.",
            };

            const message = statusMessages[newStatus.toLowerCase()] || `Order status updated: ${newStatus}`;
            toast.success(message, { duration: 5000 });

            // Fetch updated order data
            orderApi
                .getOrderBySlug(order.slug)
                .then((updatedOrder) => {
                    setOrder(updatedOrder);
                })
                .catch((error) => {
                    console.error("Failed to fetch updated order:", error);
                    // Still update status from socket data
                    setOrder((prev) => ({
                        ...prev,
                        status: newStatus as OrderStatus,
                    }));
                });
        },
    });

    useOrdersVisibilityRefresh(!!order.slug, async () => {
        if (!order.slug) return;
        try {
            const updatedOrder = await orderApi.getOrderBySlug(order.slug, { cacheBust: true });
            if (updatedOrder.status !== order.status) {
                setOrder(updatedOrder);
            }
        } catch {
            // SSE handles live updates; visibility refresh is best-effort
        }
    });

    return <OrderDetailClient order={order} />;
}
