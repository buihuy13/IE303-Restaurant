 "use client";

import OrdersPageContainer, { type OrdersPageOrder } from "@/components/client/Orders/OrdersPageContainer";
import { orderApi } from "@/lib/api/orderApi";
import { useOrdersNotificationHydrate } from "@/lib/hooks/useOrdersNotificationHydrate";
import { useOrdersVisibilityRefresh } from "@/lib/hooks/useOrdersVisibilityRefresh";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const normalizeMatchKey = (value: unknown): string => String(value ?? "").trim().toLowerCase().replace(/-/g, "");

export default function OrdersPageClient() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const authLoading = useAuthStore((state) => state.loading);
    const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
    const fetchProfile = useAuthStore((state) => state.fetchProfile);
    const loginWithKeycloak = useAuthStore((state) => state.loginWithKeycloak);

    const [orders, setOrders] = useState<OrdersPageOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = user?.id;
    const pathname = usePathname();
    const { markAllAsRead, markOrderNotificationsAsRead, notifications } = useNotificationStore();

    useOrdersNotificationHydrate(pathname === "/orders" || pathname.startsWith("/account/orders"));

    const profileRequestedRef = useRef(false);
    const redirectRef = useRef(false);
    const hasMarkedAsReadRef = useRef(false);

    const mapOrders = useCallback((apiOrders: unknown[]): OrdersPageOrder[] => {
        return apiOrders.map((order, orderIndex) => {
            if (!order || typeof order !== "object") {
                return {
                    id: `order-${orderIndex + 1}`,
                    createdAt: new Date().toISOString(),
                    totalAmount: 0,
                    items: [],
                };
            }

            const typedOrder = order as {
                orderId?: string | number;
                slug?: string;
                id?: string | number;
                _id?: string | number;
                createdAt?: string;
                updatedAt?: string;
                finalAmount?: number;
                totalAmount?: number;
                status?: string;
                paymentStatus?: string;
                items?: Array<{
                    productId?: string | number;
                    sizeId?: string;
                    productSizeId?: string;
                    sizeName?: string;
                    productName?: string;
                    price?: number;
                    quantity?: number;
                    customizations?: string;
                    imageURL?: string | null;
                    cartItemImage?: string | null;
                }>;
                restaurant?: { name?: string };
                restaurantName?: string;
            };

            const orderId =
                typedOrder.orderId?.toString() ||
                typedOrder.slug?.toString() ||
                typedOrder.id?.toString() ||
                typedOrder._id?.toString() ||
                `order-${orderIndex + 1}`;
            const rawSlug = typedOrder.slug?.toString().trim() || "";
            const safeSlug =
                rawSlug && normalizeMatchKey(rawSlug) === normalizeMatchKey(orderId) ? rawSlug : undefined;

            const restaurantName = typedOrder.restaurant?.name || typedOrder.restaurantName || "Restaurant";
            const restaurantId =
                (typedOrder.restaurant as { id?: string })?.id ||
                (typedOrder as { restaurantId?: string }).restaurantId ||
                undefined;

            const items = Array.isArray(typedOrder.items)
                ? typedOrder.items.map((item, itemIndex) => {
                      const fallbackId = `${orderId}-item-${itemIndex + 1}`;
                      const imageURL = item.imageURL && item.imageURL.trim() !== "" ? item.imageURL.trim() : null;
                      const cartItemImage =
                          item.cartItemImage && item.cartItemImage.trim() !== ""
                              ? item.cartItemImage.trim()
                              : null;
                      return {
                          id: fallbackId,
                          productId: (item.productId ?? fallbackId).toString(),
                          sizeId: item.sizeId || item.productSizeId,
                          sizeName: item.sizeName,
                          productName: item.productName || "Unknown item",
                          restaurantId,
                          restaurantName,
                          price: typeof item.price === "number" ? item.price : 0,
                          quantity: typeof item.quantity === "number" ? item.quantity : 0,
                          customizations: item.customizations || undefined,
                          imageURL: imageURL || undefined,
                          cartItemImage: cartItemImage || undefined,
                      };
                  })
                : [];

            const totalAmount = (() => {
                if (typeof typedOrder.finalAmount === "number") return typedOrder.finalAmount;
                if (typeof typedOrder.totalAmount === "number") return typedOrder.totalAmount;
                return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            })();

            return {
                id: orderId,
                slug: safeSlug,
                createdAt: typedOrder.createdAt || typedOrder.updatedAt || new Date().toISOString(),
                totalAmount,
                items,
                status: typedOrder.status as OrdersPageOrder["status"],
                paymentStatus: typedOrder.paymentStatus,
            };
        });
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!userId) {
            return;
        }

        setIsLoading(true);
        try {
            const { orders: apiOrders } = await orderApi.getOrdersByUser(userId);
            const normalized = mapOrders(apiOrders ?? []);
            setOrders(normalized);
        } catch (error) {
            console.error("Failed to load orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    }, [mapOrders, userId]);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (isAuthenticated && !userId) {
            if (!profileRequestedRef.current) {
                profileRequestedRef.current = true;
                fetchProfile().catch((error) => {
                    console.error("Failed to fetch profile before loading orders:", error);
                });
            }
            return;
        }

        if (!isAuthenticated && !userId) {
            if (!redirectRef.current) {
                redirectRef.current = true;
                setIsLoading(false);
                if (!isLoggingOut) {
                    toast.error("Please login to view your orders");
                }
                void loginWithKeycloak({
                    redirectPath: pathname || "/orders",
                });
            }
            return;
        }

        if (userId) {
            fetchOrders();

            const isFromPayment = typeof window !== "undefined" && document.referrer.includes("/payment");
            if (isFromPayment) {
                const retryTimer = setTimeout(() => {
                    fetchOrders();
                }, 1500);
                return () => clearTimeout(retryTimer);
            }
        }
    }, [authLoading, isAuthenticated, userId, isLoggingOut, fetchOrders, fetchProfile, loginWithKeycloak, pathname]);

    useEffect(() => {
        if (!isLoading && !hasMarkedAsReadRef.current) {
            const timer = setTimeout(() => {
                markAllAsRead();
                hasMarkedAsReadRef.current = true;
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isLoading, markAllAsRead]);

    useEffect(() => {
        if (pathname === "/orders" && !isLoading) {
            const unreadOrderNotifications = notifications.filter(
                (notif) => !notif.read && (notif.type === "ORDER_ACCEPTED" || notif.type === "ORDER_REJECTED"),
            );
            if (unreadOrderNotifications.length > 0) {
                markOrderNotificationsAsRead();
            }
        }
    }, [notifications, pathname, isLoading, markOrderNotificationsAsRead]);

    useEffect(() => {
        hasMarkedAsReadRef.current = false;
    }, [userId]);

    useOrderSocket({
        userId: userId || null,
        onOrderStatusUpdate: (notification) => {
            console.log("[Orders Page] Received order status update:", notification);

            const orderId = notification.data?.orderId || notification.orderId;
            const newStatus = (notification.data?.status || notification.status || "").toLowerCase() as OrdersPageOrder["status"];

            if (!orderId || !newStatus) {
                console.log("[Orders Page] Missing orderId or status in notification");
                return;
            }

            console.log("[Orders Page] Updating order:", orderId, "to status:", newStatus);

            const statusMessages: Record<string, string> = {
                confirmed: "Order confirmed! Restaurant is preparing your order.",
                preparing: "Restaurant is preparing your order.",
                ready: "Your order is ready! Delivery is on the way.",
                delivering: "Your order is out for delivery.",
                completed: "Order completed! Thank you for your order.",
                cancelled: "Order has been cancelled.",
            };
            const message = statusMessages[newStatus] || `Order ${orderId} status updated to ${newStatus}`;
            toast.success(message, { duration: 3000 });

            setOrders((prevOrders) => {
                const orderIndex = prevOrders.findIndex((o) => o.id === orderId);
                if (orderIndex === -1) {
                    setTimeout(() => {
                        fetchOrders().catch(() => {
                        });
                    }, 500);
                    return prevOrders;
                }

                const updatedOrders = [...prevOrders];
                updatedOrders[orderIndex] = {
                    ...updatedOrders[orderIndex],
                    status: newStatus,
                };

                console.log("[Orders Page] Updated order in list:", updatedOrders[orderIndex]);
                return updatedOrders;
            });
        },
    });

    useOrdersVisibilityRefresh(!!userId && !isLoading, fetchOrders);

    const handleRetry = useCallback(() => {
        if (!userId) {
            toast.error("Please login to view your orders");
            void loginWithKeycloak({
                redirectPath: pathname || "/orders",
            });
            return;
        }
        fetchOrders();
    }, [fetchOrders, userId, loginWithKeycloak, pathname]);

    const handleSortChange = useCallback(
        (sortValue: string) => {
            const sorted = [...orders].sort((a, b) => {
                switch (sortValue) {
                    case "recent":
                        const getTime = (value: string) => {
                            const timestamp = new Date(value).getTime();
                            return Number.isFinite(timestamp) ? timestamp : 0;
                        };
                        return getTime(b.createdAt) - getTime(a.createdAt);
                    case "oldest":
                        const getTimeOldest = (value: string) => {
                            const timestamp = new Date(value).getTime();
                            return Number.isFinite(timestamp) ? timestamp : 0;
                        };
                        return getTimeOldest(a.createdAt) - getTimeOldest(b.createdAt);
                    case "amount-high":
                        return b.totalAmount - a.totalAmount;
                    case "amount-low":
                        return a.totalAmount - b.totalAmount;
                    case "status":
                        const statusOrder: Record<string, number> = {
                            pending: 1,
                            confirmed: 2,
                            preparing: 3,
                            ready: 4,
                            delivering: 5,
                            completed: 6,
                            cancelled: 7,
                        };
                        const aStatus = (a.status || "").toLowerCase();
                        const bStatus = (b.status || "").toLowerCase();
                        return (statusOrder[aStatus] || 99) - (statusOrder[bStatus] || 99);
                    default:
                        return 0;
                }
            });
            setOrders(sorted);
        },
        [orders],
    );

    return (
        <OrdersPageContainer
            orders={orders}
            isLoading={isLoading}
            onRetry={handleRetry}
            onSortChange={handleSortChange}
        />
    );
}

