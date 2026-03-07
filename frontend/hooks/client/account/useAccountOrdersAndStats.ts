import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart, PackageCheck, ShoppingBag } from "lucide-react";
import { orderApi } from "@/lib/api/orderApi";
import { formatCurrency } from "@/lib/utils/dashboardFormat";
import type { Order } from "@/types/order.type";

export interface AccountStat {
    name: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface RecentOrderDisplay {
    id: string;
    displayId: string;
    date: string;
    total: string;
    status: string;
    statusClass?: string;
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
    return statusMap[status.toLowerCase()] ?? status;
}

function getStatusBadgeClass(status: string): string {
    const s = status.toLowerCase();
    if (s.includes("completed")) return "bg-green-100 text-green-800";
    if (s.includes("cancelled")) return "bg-red-100 text-red-800";
    if (s.includes("pending")) return "bg-yellow-100 text-yellow-800";
    if (s.includes("preparing") || s.includes("ready")) return "bg-blue-100 text-blue-800";
    if (s.includes("confirmed")) return "bg-indigo-100 text-indigo-800";
    return "bg-gray-100 text-gray-800";
}

export function useAccountOrdersAndStats(userId: string | undefined, enabled: boolean) {
    const [stats, setStats] = useState<AccountStat[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrderDisplay[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    const fetchOrdersAndStats = useCallback(async () => {
        if (!userId) {
            setOrdersLoading(false);
            return;
        }
        try {
            setOrdersLoading(true);
            const { orders } = await orderApi.getOrdersByUser(userId);
            const sorted = [...orders].sort((a, b) => {
                const tA = new Date(a.createdAt ?? 0).getTime();
                const tB = new Date(b.createdAt ?? 0).getTime();
                return tB - tA;
            });
            const totalOrders = sorted.length;
            const lastOrder = sorted[0] ?? null;
            const lastOrderStatus = lastOrder?.status ?? "N/A";

            const dishCountMap = new Map<string, number>();
            sorted.forEach((order: Order) => {
                order.items?.forEach((item) => {
                    const name = item.productName ?? "Unknown";
                    dishCountMap.set(name, (dishCountMap.get(name) ?? 0) + item.quantity);
                });
            });
            let favoriteDish = "N/A";
            let maxCount = 0;
            dishCountMap.forEach((count, name) => {
                if (count > maxCount) {
                    maxCount = count;
                    favoriteDish = name;
                }
            });

            setStats([
                { name: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag },
                { name: "Last Order Status", value: formatStatus(lastOrderStatus), icon: PackageCheck },
                { name: "Favorite Dish", value: favoriteDish, icon: Heart },
            ]);

            const recent = sorted.slice(0, 3).map((order: Order, index: number) => {
                const orderDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                      })
                    : "N/A";
                const orderId = order.orderId ?? `order-${index}`;
                const uniqueId = order.createdAt
                    ? `${orderId}-${new Date(order.createdAt).getTime()}`
                    : `${orderId}-${index}`;
                const status = formatStatus(order.status ?? "pending");
                return {
                    id: uniqueId,
                    displayId: order.orderId ?? `#${index + 1}`,
                    date: orderDate,
                    total: formatCurrency(Number(order.finalAmount ?? 0)),
                    status,
                    statusClass: getStatusBadgeClass(status),
                };
            });
            setRecentOrders(recent);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            toast.error("Failed to load order data");
        } finally {
            setOrdersLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (enabled && userId) {
            fetchOrdersAndStats();
        }
    }, [enabled, userId, fetchOrdersAndStats]);

    return { stats, recentOrders, ordersLoading, fetchOrdersAndStats };
}
