import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { Order, OrderStatus } from "@/types/order.type";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface AccountOrderDisplay {
    id: string;
    slug?: string;
    uniqueKey: string;
    displayId: string;
    date: string;
    total: string;
    status: string;
    statusClass: string;
    orderCode?: string;
}

function formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready: "Ready",
        completed: "Completed",
        cancelled: "Cancelled",
    };
    return statusMap[status.toLowerCase()] || status;
}

function getStatusBadgeClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("completed")) return "text-green-600";
    if (statusLower.includes("cancelled")) return "text-red-600";
    return "text-[#EE4D2D]";
}

function formatOrderDate(createdAt?: string): string {
    if (!createdAt) return "N/A";
    return new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function formatOrderTotal(finalAmount?: number): string {
    return `$${Number(finalAmount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function mapOrders(orders: Order[]): AccountOrderDisplay[] {
    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    return sortedOrders.map((order, index) => {
        const status = formatStatus(order.status || OrderStatus.PENDING);
        const orderId = order.orderId || `order-${index}`;
        const uniqueKey = order.createdAt ? `${orderId}-${new Date(order.createdAt).getTime()}` : `${orderId}-${index}`;

        return {
            id: order.orderId,
            slug: order.slug || undefined,
            uniqueKey,
            displayId: order.orderId || `#${index + 1}`,
            date: formatOrderDate(order.createdAt),
            total: formatOrderTotal(order.finalAmount),
            status,
            statusClass: getStatusBadgeClass(status),
            orderCode: order.orderId,
        };
    });
}

function getStatusMessage(newStatus: string, orderId: string): string {
    const statusMessages: Record<string, string> = {
        confirmed: "Order confirmed! Restaurant is preparing your order.",
        preparing: "Restaurant is preparing your order.",
        ready: "Your order is ready! Delivery is on the way.",
        completed: "Order completed! Thank you for your order.",
        cancelled: "Order has been cancelled.",
    };
    return statusMessages[newStatus] || `Order ${orderId} status updated to ${newStatus}`;
}

export function useAccountOrdersList(params: { userId: string | null; enabled: boolean }) {
    const { userId, enabled } = params;
    const [orders, setOrders] = useState<AccountOrderDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!userId) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { orders: apiOrders } = await orderApi.getOrdersByUser(userId);
            setOrders(mapOrders(apiOrders));
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load orders");
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!enabled || !userId) return;
        refresh();
    }, [enabled, userId, refresh]);

    useOrderSocket({
        userId,
        onOrderStatusUpdate: (notification) => {
            const orderId = notification.data?.orderId || notification.orderId;
            const newStatus = (notification.data?.status || notification.status || "").toLowerCase();

            if (!orderId || !newStatus) return;
            toast.success(getStatusMessage(newStatus, orderId), { duration: 3000 });

            setOrders((prevOrders) => {
                const orderIndex = prevOrders.findIndex((order) => order.id === orderId);
                if (orderIndex === -1) {
                    setTimeout(() => {
                        refresh().catch(() => {});
                    }, 500);
                    return prevOrders;
                }

                const updatedOrders = [...prevOrders];
                updatedOrders[orderIndex] = {
                    ...updatedOrders[orderIndex],
                    status: formatStatus(newStatus),
                    statusClass: getStatusBadgeClass(newStatus),
                };
                return updatedOrders;
            });
        },
    });

    useEffect(() => {
        if (!enabled || !userId || isLoading) return;

        const intervalId = setInterval(() => {
            orderApi
                .getOrdersByUser(userId)
                .then(({ orders: apiOrders }) => {
                    const mappedOrders = mapOrders(apiOrders);
                    setOrders((prevOrders) => {
                        const hasChanges = prevOrders.some((prevOrder, index) => {
                            const newOrder = mappedOrders[index];
                            return newOrder && prevOrder.status !== newOrder.status;
                        });
                        if (hasChanges || prevOrders.length !== mappedOrders.length) {
                            return mappedOrders;
                        }
                        return prevOrders;
                    });
                })
                .catch((error) => {
                    console.debug("[Account Orders] Polling update failed:", error);
                });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [enabled, userId, isLoading]);

    return { orders, isLoading, refresh };
}
import { orderApi } from "@/lib/api/orderApi";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { OrderStatus, type Order } from "@/types/order.type";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export interface AccountOrderDisplay {
    id: string;
    slug?: string;
    uniqueKey: string;
    displayId: string;
    date: string;
    total: string;
    status: string;
    statusClass: string;
    orderCode?: string;
}

function formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready: "Ready",
        completed: "Completed",
        cancelled: "Cancelled",
    };
    return statusMap[status.toLowerCase()] || status;
}

function getStatusTextClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes("completed")) return "text-green-600";
    if (s.includes("cancelled")) return "text-red-600";
    return "text-[#EE4D2D]";
}

function formatPriceUSD(amount: number): string {
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function mapOrdersToDisplay(apiOrders: Order[]): AccountOrderDisplay[] {
    const sorted = [...apiOrders].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
    });

    return sorted.map((order: Order, index: number) => {
        const orderDate = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
              })
            : "N/A";

        const status = formatStatus(order.status || OrderStatus.PENDING);
        const orderId = order.orderId || `order-${index}`;
        const uniqueKey = order.createdAt ? `${orderId}-${new Date(order.createdAt).getTime()}` : `${orderId}-${index}`;

        return {
            id: order.orderId,
            slug: order.slug || undefined,
            uniqueKey,
            displayId: order.orderId || `#${index + 1}`,
            date: orderDate,
            total: `$${formatPriceUSD(Number(order.finalAmount || 0))}`,
            status,
            statusClass: getStatusTextClass(status),
            orderCode: order.orderId,
        };
    });
}

export function useAccountOrdersList(params: { userId: string | null; enabled: boolean }) {
    const { userId, enabled } = params;
    const [orders, setOrders] = useState<AccountOrderDisplay[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { orders: apiOrders } = await orderApi.getOrdersByUser(userId);
            setOrders(mapOrdersToDisplay(apiOrders));
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Failed to load orders");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!enabled) return;
        refresh();
    }, [enabled, refresh]);

    const statusMessages = useMemo<Record<string, string>>(
        () => ({
            confirmed: "Order confirmed! Restaurant is preparing your order.",
            preparing: "Restaurant is preparing your order.",
            ready: "Your order is ready! Delivery is on the way.",
            completed: "Order completed! Thank you for your order.",
            cancelled: "Order has been cancelled.",
        }),
        [],
    );

    useOrderSocket({
        userId: enabled ? userId : null,
        onOrderStatusUpdate: (notification) => {
            const orderId = notification.data?.orderId || notification.orderId;
            const newStatus = (notification.data?.status || notification.status || "").toLowerCase();
            if (!orderId || !newStatus) return;

            const message = statusMessages[newStatus] || `Order ${orderId} status updated to ${newStatus}`;
            toast.success(message, { duration: 3000 });

            setOrders((prev) => {
                const idx = prev.findIndex((o) => o.id === orderId);
                if (idx === -1) {
                    setTimeout(() => {
                        refresh().catch(() => {});
                    }, 500);
                    return prev;
                }

                const next = [...prev];
                next[idx] = {
                    ...next[idx],
                    status: formatStatus(newStatus),
                    statusClass: getStatusTextClass(newStatus),
                };
                return next;
            });
        },
    });

    useEffect(() => {
        if (!enabled || !userId || loading) return;

        const intervalId = setInterval(() => {
            orderApi
                .getOrdersByUser(userId)
                .then(({ orders: apiOrders }) => {
                    const mapped = mapOrdersToDisplay(apiOrders);
                    setOrders((prev) => {
                        const hasChanges = prev.some((prevOrder, index) => {
                            const newOrder = mapped[index];
                            return newOrder && prevOrder.status !== newOrder.status;
                        });
                        if (hasChanges || prev.length !== mapped.length) {
                            return mapped;
                        }
                        return prev;
                    });
                })
                .catch((error) => {
                    console.debug("[Order History Page] Polling update failed:", error);
                });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [enabled, userId, loading]);

    return { orders, loading, refresh };
}

