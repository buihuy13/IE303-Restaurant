"use client";

import { orderApi } from "@/lib/api/orderApi";
import { queryApi } from "@/lib/api/queryApi";
import {
    computeRouteBasedEtaMinutes,
    fallbackEtaMinutesWithoutRoute,
} from "@/lib/delivery/computeRouteBasedEtaMinutes";
import { useOrderSocket } from "@/lib/hooks/useOrderSocket";
import { useOrdersVisibilityRefresh } from "@/lib/hooks/useOrdersVisibilityRefresh";
import { getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, OrderStatus } from "@/types/order.type";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import OrderTrackingTimeline from "../Orders/OrderTrackingTimeline";
import { OrderStatusSidebar } from "./OrderStatusSidebar";

// Helper function to parse productId and extract imageURL from encoded options
const parseProductIdForImage = (productId: string): string | null => {
    try {
        const separatorIndex = productId.indexOf("--");
        if (separatorIndex === -1) {
            return null;
        }
        
        const encoded = productId.slice(separatorIndex + 2);
        // Base64 URL decode
        const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "===".slice((base64.length + 3) % 4);
        const binary = atob(padded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const json = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(json);
        
        if (parsed && typeof parsed === "object" && parsed.imageURL) {
            return parsed.imageURL;
        }
    } catch (error) {
        console.debug("[Delivery] Failed to parse productId for image:", error);
    }
    return null;
};

type StatusType = "Pending" | "Success" | "Cancel";

type DisplayOrderStatus = {
    orderValidate: StatusType;
    orderReceived: StatusType;
    restaurantStatus: StatusType;
    deliveryStatus: StatusType;
    estimatedTime: number;
};

type DisplayOrderItem = {
    id: string;
    name: string;
    shopName: string;
    price: number;
    quantity: number;
    note?: string;
    imageURL?: string | null;
};

const formatPriceVND = (amount: number): string => `${Math.round(amount).toLocaleString("vi-VN")} ₫`;

function getDeliveryCoords(o: Order): { lat: number; lon: number } | null {
    const lat = o.deliveryAddress?.latitude;
    const lon = o.deliveryAddress?.longitude;
    if (typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon)) {
        return { lat, lon };
    }
    return null;
}

function readBrowserGeolocation(): Promise<{ lat: number; lon: number } | null> {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.geolocation) {
        return Promise.resolve(null);
    }
    return new Promise((resolve) => {
        const timer = window.setTimeout(() => resolve(null), 8000);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                window.clearTimeout(timer);
                resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            },
            () => {
                window.clearTimeout(timer);
                resolve(null);
            },
            { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8000 },
        );
    });
}

interface DeliveryStatusPageClientWrapperProps {
    initialOrder: Order;
}

export default function DeliveryStatusPageClientWrapper({ initialOrder }: DeliveryStatusPageClientWrapperProps) {
    const { user } = useAuthStore();
    const { items: cartItems } = useCartStore();
    // Normalize initialOrder status right away to ensure consistency
    const normalizedInitialOrder: Order = {
        ...initialOrder,
        status: (initialOrder.status || "").toLowerCase() as OrderStatus,
    };
    const [order, setOrder] = useState<Order>(normalizedInitialOrder);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    /** Minutes: query-service route (seconds → min) + 15–20 prep; null if not resolved yet / inactive order. */
    const [routeBasedEtaMinutes, setRouteBasedEtaMinutes] = useState<number | null>(null);
    const [routeEtaLoading, setRouteEtaLoading] = useState(true);
    
    // Use ref to store current order to avoid stale closure in websocket callback
    const orderRef = useRef<Order>(normalizedInitialOrder);

    // Update ref when order changes
    useEffect(() => {
        orderRef.current = order;
    }, [order]);

    // Fetch latest order data on mount to ensure we have the most up-to-date status
    // This fixes the issue where completed orders don't show correct status when clicking "Track Order"
    useEffect(() => {
        if (!initialOrder.slug || !isInitialLoad) return;

        setIsInitialLoad(false);
        
        // Always fetch latest order data immediately to ensure we have the most up-to-date status
        // This is critical for completed orders that may have been updated after page cache
        // Use cacheBust: true to force fetch fresh data from server
        orderApi
            .getOrderById(initialOrder.orderId, { cacheBust: true })
            .then((latestOrder) => {
                console.log("[DeliveryStatusPage] Fetched latest order on mount:", latestOrder);
                console.log("[DeliveryStatusPage] Latest order status:", latestOrder.status);
                // Normalize status to ensure consistency
                const normalizedOrder = {
                    ...latestOrder,
                    status: (latestOrder.status || "").toLowerCase() as OrderStatus,
                };
                console.log("[DeliveryStatusPage] Normalized order status:", normalizedOrder.status);
                setOrder(normalizedOrder);
            })
            .catch((error) => {
                console.error("[DeliveryStatusPage] Failed to fetch latest order on mount:", error);
                // Status already normalized in normalizedInitialOrder
            });
    }, [initialOrder.slug, initialOrder.orderId, isInitialLoad]);

    // ETA from query-service: route duration (seconds) → minutes + preparation buffer
    useEffect(() => {
        let cancelled = false;
        const normalized = (order.status || "").toLowerCase();
        if (normalized === OrderStatus.COMPLETED || normalized === OrderStatus.CANCELLED) {
            setRouteBasedEtaMinutes(null);
            setRouteEtaLoading(false);
            return;
        }

        const restaurantId = (order.restaurantId || order.restaurant?.id || "").trim();
        if (!restaurantId || !order.orderId) {
            setRouteBasedEtaMinutes(null);
            setRouteEtaLoading(false);
            return;
        }

        if (order.estimatedDeliveryTime) {
            const t = new Date(order.estimatedDeliveryTime).getTime();
            if (!Number.isNaN(t)) {
                setRouteBasedEtaMinutes(null);
                setRouteEtaLoading(false);
                return;
            }
        }

        setRouteEtaLoading(true);
        setRouteBasedEtaMinutes(null);

        void (async () => {
            let coords = getDeliveryCoords(order);
            if (!coords) {
                coords = await readBrowserGeolocation();
            }
            if (cancelled) return;
            if (!coords) {
                setRouteBasedEtaMinutes(null);
                setRouteEtaLoading(false);
                return;
            }
            try {
                const seconds = await queryApi.getRestaurantRouteDurationSeconds(
                    restaurantId,
                    coords.lat,
                    coords.lon,
                );
                if (cancelled) return;
                setRouteBasedEtaMinutes(computeRouteBasedEtaMinutes(seconds, order.orderId));
            } catch (e) {
                console.debug("[DeliveryStatusPage] query-service route ETA failed:", e);
                if (!cancelled) {
                    setRouteBasedEtaMinutes(fallbackEtaMinutesWithoutRoute(order.orderId));
                }
            } finally {
                if (!cancelled) setRouteEtaLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        order.orderId,
        order.status,
        order.restaurantId,
        order.restaurant?.id,
        order.estimatedDeliveryTime,
        order.deliveryAddress?.latitude,
        order.deliveryAddress?.longitude,
    ]);

    // Listen for order status updates via WebSocket
    useOrderSocket({
        userId: user?.id || null,
        onOrderStatusUpdate: (notification) => {
            console.log("[DeliveryStatusPage] Received order status update notification:", notification);
            console.log("[DeliveryStatusPage] Full notification object:", JSON.stringify(notification, null, 2));
            
            // Backend emits orderId and status at root level, not in data
            const notificationOrderId = notification.orderId || notification.data?.orderId;
            const newStatus = notification.status || notification.data?.status;

            // Get current order from ref (always latest)
            const currentOrder = orderRef.current;
            const currentOrderId = currentOrder.orderId;

            console.log("[DeliveryStatusPage] Notification orderId:", notificationOrderId, "Current orderId:", currentOrderId);
            console.log("[DeliveryStatusPage] Notification status:", newStatus, "Current status:", currentOrder.status);

            // Only update if this is the order we're viewing
            if (!notificationOrderId || notificationOrderId !== currentOrderId) {
                    console.log("[DeliveryStatusPage] Order ID mismatch, ignoring update. Expected:", currentOrderId, "Got:", notificationOrderId);
                return;
            }

            if (!newStatus) {
                console.log("[DeliveryStatusPage] No status in notification, ignoring");
                return;
            }

            // Normalize status to lowercase to match OrderStatus enum
            const normalizedNewStatus = (newStatus || "").toLowerCase() as OrderStatus;
            const normalizedCurrentStatus = (currentOrder.status || "").toLowerCase();
            
            // Skip if status hasn't actually changed
            if (normalizedNewStatus === normalizedCurrentStatus) {
                console.log("[DeliveryStatusPage] Status unchanged, skipping update:", normalizedNewStatus);
                return;
            }

            console.log("[DeliveryStatusPage] Updating order status from socket:", normalizedCurrentStatus, "->", normalizedNewStatus);

            // Show toast notification
            const statusMessages: Record<string, string> = {
                confirmed: "Order confirmed! Restaurant is preparing your order.",
                preparing: "Restaurant is preparing your order.",
                ready: "Your order is ready! Delivery is on the way.",
                completed: "Order completed! Thank you for your order.",
                cancelled: "Order has been cancelled.",
            };

            const message = statusMessages[normalizedNewStatus] || `Order status updated: ${normalizedNewStatus}`;
            toast.success(message, { duration: 5000 });

            // Update order status immediately from socket data (optimistic update)
            // This ensures UI updates immediately, including OrderTrackingTimeline
            setOrder((prevOrder) => {
                console.log("[DeliveryStatusPage] Setting order status to:", normalizedNewStatus);
                return {
                    ...prevOrder,
                    status: normalizedNewStatus,
                };
            });

            // Fetch updated order data to get all latest information (estimatedDeliveryTime, etc.)
            // Use cacheBust: true to force fetch fresh data
            setIsUpdating(true);
            orderApi
                .getOrderById(currentOrderId, { cacheBust: true })
                .then((fetchedOrder) => {
                    console.log("[DeliveryStatusPage] Fetched updated order after socket update:", fetchedOrder);
                    console.log("[DeliveryStatusPage] Fetched order status:", fetchedOrder.status);
                    // Normalize status to ensure consistency
                    const normalizedOrder = {
                        ...fetchedOrder,
                        status: (fetchedOrder.status || "").toLowerCase() as OrderStatus,
                    };
                    console.log("[DeliveryStatusPage] Setting order with normalized status:", normalizedOrder.status);
                    setOrder(normalizedOrder);
                })
                .catch((error) => {
                    console.error("[DeliveryStatusPage] Failed to fetch updated order:", error);
                    // Status already updated from socket data above, so UI is already updated
                    // Still update status from socket data as fallback to ensure consistency
                    setOrder((prev) => ({
                        ...prev,
                        status: normalizedNewStatus,
                    }));
                })
                .finally(() => {
                    setIsUpdating(false);
                });
        },
    });

    const normalizedStatusForPoll = (order.status || "").toLowerCase();
    const canRefreshOrder =
        !!order.orderId &&
        normalizedStatusForPoll !== OrderStatus.COMPLETED &&
        normalizedStatusForPoll !== OrderStatus.CANCELLED;

    useOrdersVisibilityRefresh(canRefreshOrder, async () => {
        if (!order.orderId) return;
        try {
            const updatedOrder = await orderApi.getOrderById(order.orderId, { cacheBust: true });
            const normalizedUpdatedStatus = (updatedOrder.status || "").toLowerCase();
            const normalizedCurrentStatus = (order.status || "").toLowerCase();

            if (
                normalizedUpdatedStatus !== normalizedCurrentStatus ||
                updatedOrder.estimatedDeliveryTime !== order.estimatedDeliveryTime
            ) {
                setOrder({
                    ...updatedOrder,
                    status: normalizedUpdatedStatus as OrderStatus,
                });
            }
        } catch {
            // SSE handles live updates
        }
    });

    // Update estimated time every minute for real-time countdown
    useEffect(() => {
        if (
            !order.orderId ||
            !order.estimatedDeliveryTime ||
            order.status === OrderStatus.COMPLETED ||
            order.status === OrderStatus.CANCELLED
        ) {
            return;
        }

        const intervalId = setInterval(() => {
            // Force re-render to update estimated time countdown
            setOrder((prevOrder) => ({ ...prevOrder }));
        }, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, [order.orderId, order.estimatedDeliveryTime, order.status]);

    const displayItems: DisplayOrderItem[] = order.items.map((item, index) => {
        // Priority: cartItemImage > imageURL > productId encoded options > cart store > null
        let imageURL: string | null = null;
        
        // Helper function to check if image URL is valid
        const isValidImageUrl = (url: string | null | undefined): boolean => {
            if (!url || typeof url !== "string") return false;
            const trimmed = url.trim();
            return trimmed !== "" && trimmed !== "/placeholder.png";
        };
        
        // 1. Check cartItemImage first (vì cart chỉ có cartItemImage)
        if (isValidImageUrl(item.cartItemImage)) {
            imageURL = item.cartItemImage!.trim();
        }
        // 2. Fallback to imageURL if cartItemImage is not available
        else if (isValidImageUrl(item.imageURL)) {
            imageURL = item.imageURL!.trim();
        }
        // 3. Try to extract imageURL from productId encoded options
        else {
            const imageFromProductId = parseProductIdForImage(item.productId);
            if (isValidImageUrl(imageFromProductId)) {
                imageURL = imageFromProductId!.trim();
            }
        }
        
        // 4. If still no image, try to find it from cart store by productId
        if (!imageURL) {
            const cartItem = cartItems.find(
                (cartItem) => cartItem.baseProductId === item.productId || cartItem.id === item.productId
            );
            if (cartItem) {
                const cartImageUrl = getImageUrl(cartItem.image);
                if (isValidImageUrl(cartImageUrl)) {
                    imageURL = cartImageUrl;
                }
            }
        }
        
        return {
            id: `${order.orderId}-${item.productId}-${index}`,
            name: item.productName,
            shopName: order.restaurant?.name || "Restaurant",
            price: item.price,
            quantity: item.quantity,
            note: item.customizations,
            imageURL: imageURL,
        };
    });

    const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

    const status: DisplayOrderStatus = (() => {
        // Normalize status to handle case-insensitive comparisons
        const normalizedStatus = (order.status || "").toLowerCase() as OrderStatus;
        
        console.log("[DeliveryStatusPage] Current order status:", order.status, "Normalized:", normalizedStatus);
        
        const isCancelled = normalizedStatus === OrderStatus.CANCELLED;
        // Order Received: Success if status is not pending
        const isReceived = normalizedStatus !== OrderStatus.PENDING;
        // Restaurant Status: Success if status is confirmed, preparing, ready, or completed
        // This matches timeline step 1 (Preparing) which includes CONFIRMED and PREPARING
        const isRestaurantDone =
            normalizedStatus === OrderStatus.CONFIRMED ||
            normalizedStatus === OrderStatus.PREPARING ||
            normalizedStatus === OrderStatus.READY ||
            normalizedStatus === OrderStatus.DELIVERING ||
            normalizedStatus === OrderStatus.COMPLETED;
        // Delivery Status: Success only if order is completed
        // This matches timeline step 3 (Completed)
        const isDelivering = normalizedStatus === OrderStatus.COMPLETED;

        const estimatedTime = (() => {
            // Don't calculate estimated time if order is completed or cancelled
            if (normalizedStatus === OrderStatus.COMPLETED || normalizedStatus === OrderStatus.CANCELLED) {
                return 0;
            }

            const minutesUntilServerEta = (): number | null => {
                if (!order.estimatedDeliveryTime) return null;
                try {
                    const eta = new Date(order.estimatedDeliveryTime).getTime();
                    if (Number.isNaN(eta)) return null;
                    const diffMinutes = Math.round((eta - Date.now()) / 60000);
                    if (diffMinutes < 0) return 1;
                    return Math.max(1, diffMinutes);
                } catch (error) {
                    console.error("Error calculating estimated time:", error, order.estimatedDeliveryTime);
                    return null;
                }
            };

            const serverMinutes = minutesUntilServerEta();
            if (serverMinutes != null) {
                return serverMinutes;
            }

            if (routeBasedEtaMinutes != null) {
                return routeBasedEtaMinutes;
            }
            if (routeEtaLoading) {
                return 0;
            }
            return fallbackEtaMinutesWithoutRoute(order.orderId || "order");
        })();

        return {
            orderValidate: "Success",
            orderReceived: isCancelled ? "Cancel" : isReceived ? "Success" : "Pending",
            restaurantStatus: isCancelled ? "Cancel" : isRestaurantDone ? "Success" : "Pending",
            deliveryStatus: isCancelled ? "Cancel" : isDelivering ? "Success" : "Pending",
            estimatedTime,
        };
    })();

    const canCancel = (order.status || "").toLowerCase() === OrderStatus.PENDING;

    const groupedItems = displayItems.reduce(
        (acc, item) => {
            const { shopName } = item;
            if (!acc[shopName]) {
                acc[shopName] = [];
            }
            acc[shopName].push(item);
            return acc;
        },
        {} as Record<string, DisplayOrderItem[]>,
    );

    if (!order) {
        notFound();
    }

    return (
        <div className="custom-container py-8 sm:py-10 lg:py-12">
            {isUpdating && (
                <div className="fixed top-20 right-4 bg-white/90 backdrop-blur-xl text-gray-900 px-4 py-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 flex items-center gap-2 border border-gray-200">
                    <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold">Updating order status...</span>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
                {/* Left column: Order details */}
                <div className="lg:col-span-2 space-y-6">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                        Order Tracking ({totalItems} {totalItems > 1 ? "items" : "item"})
                    </h1>

                    {/* Order Status Timeline */}
                    <OrderTrackingTimeline status={(order.status || "").toLowerCase() as OrderStatus} />

                    <div className="space-y-8">
                        {Object.entries(groupedItems).map(([shopName, items]) => (
                            <div key={shopName} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex items-end justify-between gap-4 mb-4">
                                    <h2 className="text-lg font-semibold tracking-tight text-gray-900">{shopName}</h2>
                                    <span className="text-xs font-semibold text-gray-500">
                                        {items.length} {items.length === 1 ? "item" : "items"}
                                    </span>
                                </div>
                                <div className="space-y-4 border-t border-gray-200 pt-4">
                                    {items.map((item) => {
                                        const imageUrl = getImageUrl(item.imageURL || null);
                                        const finalImageUrl = imageUrl || "/placeholder.png";
                                        const hasImage = finalImageUrl && finalImageUrl !== "/placeholder.png";
                                        
                                        return (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                                        >
                                            {/* Product image */}
                                            {hasImage ? (
                                                <div className="relative w-[64px] h-[64px] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-200">
                                                    <Image
                                                        src={finalImageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                        unoptimized={finalImageUrl.startsWith("http")}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-[64px] h-[64px] rounded-2xl bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-900 leading-snug">{item.name}</p>
                                                {item.note ? (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.note}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 mt-1">No notes</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                <p className="font-bold text-brand-orange">{formatPriceVND(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: Order status information */}
                <div className="lg:col-span-1">
                    <OrderStatusSidebar 
                        status={status} 
                        orderId={order.orderId} 
                        canCancel={canCancel}
                        orderStatus={order.status}
                        etaLoading={routeEtaLoading && !order.estimatedDeliveryTime}
                        order={order}
                        onOrderUpdate={async () => {
                            // Refresh order data after payment
                            try {
                                const updatedOrder = await orderApi.getOrderById(order.orderId, { cacheBust: true });
                                const normalizedOrder = {
                                    ...updatedOrder,
                                    status: (updatedOrder.status || "").toLowerCase() as OrderStatus,
                                };
                                setOrder(normalizedOrder);
                            } catch (error) {
                                console.error("[DeliveryStatusPage] Failed to refresh order after payment:", error);
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
