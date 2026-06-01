"use client";

import { getApiBaseUrl } from "@/lib/axios";
import { subscribeNewOrders, subscribeOrderStatusUpdates } from "@/lib/orderSSEBridge";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, useState } from "react";

const ORDER_LIFECYCLE_STATUSES = new Set(["pending", "confirmed", "preparing", "ready", "delivering", "completed", "cancelled"]);
const PAYMENT_STATUSES = new Set(["unpaid", "pending", "paid", "completed", "failed", "refunded"]);

export interface OrderNotification {
    type: string;
    eventType?: string;
    data?: {
        orderId: string;
        totalAmount?: number;
        itemCount?: number;
        customerNote?: string;
        createdAt?: string;
        status?: string;
        paymentStatus?: string;
        restaurantName?: string;
        reason?: string;
    };
    orderId?: string;
    status?: string;
    previousStatus?: string;
    paymentStatus?: string;
    cancellationReason?: string;
    timestamp: Date;
    sound?: string;
}

interface UseOrderSocketOptions {
    restaurantId?: string | null;
    userId?: string | null;
    onNewOrder?: (notification: OrderNotification) => void;
    onOrderStatusUpdate?: (notification: OrderNotification) => void;
    onPaymentStatusUpdate?: (notification: OrderNotification) => void;
}

/** Reconnect delay: starts at 2s, caps at 30s */
function getReconnectDelay(attempt: number): number {
    return Math.min(2000 * Math.pow(1.5, attempt), 30_000);
}

function parseSSEData(raw: string): OrderNotification | null {
    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const eventType = typeof parsed.eventType === "string" ? parsed.eventType : undefined;
        const rawStatus = typeof parsed.status === "string" ? parsed.status : undefined;
        const isPaymentEvent = eventType?.toUpperCase() === "PAYMENT_STATUS";
        const orderStatus =
            typeof parsed.orderStatus === "string" ? parsed.orderStatus : isPaymentEvent ? undefined : rawStatus;
        const paymentStatus =
            typeof parsed.paymentStatus === "string" ? parsed.paymentStatus : isPaymentEvent ? rawStatus : undefined;

        if (parsed.orderId && parsed.status && !parsed.data) {
            return {
                type: "ORDER_NOTIFICATION",
                eventType,
                data: {
                    orderId: String(parsed.orderId),
                    totalAmount: typeof parsed.totalPrice === "number" ? parsed.totalPrice : Number(parsed.totalPrice || 0),
                    itemCount: typeof parsed.itemCount === "number" ? parsed.itemCount : 1,
                    status: orderStatus,
                    paymentStatus,
                    restaurantName: String(parsed.restaurantName || ""),
                    createdAt: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date().toISOString(),
                },
                orderId: String(parsed.orderId),
                status: orderStatus,
                paymentStatus,
                timestamp: parsed.timestamp ? new Date(parsed.timestamp as string) : new Date(),
            };
        }

        return {
            type: typeof parsed.type === "string" ? parsed.type : "unknown",
            eventType,
            data:
                parsed.data && typeof parsed.data === "object"
                    ? (parsed.data as OrderNotification["data"])
                    : undefined,
            orderId: typeof parsed.orderId === "string" ? parsed.orderId : undefined,
            status: orderStatus,
            previousStatus: typeof parsed.previousStatus === "string" ? parsed.previousStatus : undefined,
            paymentStatus,
            cancellationReason:
                typeof parsed.cancellationReason === "string" ? parsed.cancellationReason : undefined,
            timestamp: parsed.timestamp ? new Date(parsed.timestamp as string) : new Date(),
            sound: typeof parsed.sound === "string" ? parsed.sound : undefined,
        };
    } catch {
        return null;
    }
}

function dispatchNotification(
    notification: OrderNotification,
    onNewOrder?: (n: OrderNotification) => void,
    onOrderStatusUpdate?: (n: OrderNotification) => void,
    onPaymentStatusUpdate?: (n: OrderNotification) => void,
) {
    const status = (notification.status || notification.data?.status || "").toLowerCase();
    const paymentStatus = (notification.paymentStatus || notification.data?.paymentStatus || status).toLowerCase();

    if (
        notification.eventType?.toUpperCase() === "PAYMENT_STATUS" ||
        (!ORDER_LIFECYCLE_STATUSES.has(status) && PAYMENT_STATUSES.has(paymentStatus))
    ) {
        onPaymentStatusUpdate?.(notification);
        return;
    }

    if (!ORDER_LIFECYCLE_STATUSES.has(status)) {
        return;
    }

    if (status === "pending" || notification.type === "new-order" || notification.type === "NEW_ORDER") {
        onNewOrder?.(notification);
        return;
    }

    onOrderStatusUpdate?.(notification);
}

/**
 * Customer order pages: subscribe to global useSSE bridge (no second EventSource).
 * Merchant dashboards: direct EventSource on API gateway (merchants do not use SSEProvider).
 */
export function useOrderSocket({
    restaurantId,
    userId,
    onNewOrder,
    onOrderStatusUpdate,
    onPaymentStatusUpdate,
}: UseOrderSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const esRef = useRef<EventSource | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef(0);
    const isMountedRef = useRef(false);
    const onNewOrderRef = useRef(onNewOrder);
    const onOrderStatusUpdateRef = useRef(onOrderStatusUpdate);
    const onPaymentStatusUpdateRef = useRef(onPaymentStatusUpdate);

    onNewOrderRef.current = onNewOrder;
    onOrderStatusUpdateRef.current = onOrderStatusUpdate;
    onPaymentStatusUpdateRef.current = onPaymentStatusUpdate;

    const isMerchantSocket = Boolean(restaurantId);

    // Customer: listen to shared SSE from SSEProvider / useSSE
    useEffect(() => {
        if (isMerchantSocket || !userId) {
            return;
        }

        isMountedRef.current = true;
        setIsConnected(true);

        const handleStatus = (notification: OrderNotification) => {
            if (!isMountedRef.current) return;
            dispatchNotification(
                notification,
                onNewOrderRef.current,
                onOrderStatusUpdateRef.current,
                onPaymentStatusUpdateRef.current,
            );
        };

        const unsubStatus = subscribeOrderStatusUpdates(handleStatus);
        const unsubNew = subscribeNewOrders((notification) => {
            if (!isMountedRef.current) return;
            onNewOrderRef.current?.(notification);
        });

        return () => {
            isMountedRef.current = false;
            unsubStatus();
            unsubNew();
            setIsConnected(false);
        };
    }, [isMerchantSocket, userId]);

    // Merchant: dedicated EventSource (unchanged behavior)
    useEffect(() => {
        if (!isMerchantSocket || !userId) {
            if (!userId) {
                setIsConnected(false);
            }
            return;
        }

        isMountedRef.current = true;

        const closeEventSource = () => {
            const current = esRef.current;
            if (!current) {
                return;
            }
            esRef.current = null;
            current.close();
        };

        const connect = () => {
            if (!isMountedRef.current) {
                return;
            }

            closeEventSource();

            const accessToken = useAuthStore.getState().accessToken;
            const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
            const sseUrl = accessToken
                ? `${baseUrl}/sse/subscribe/${userId}?token=${encodeURIComponent(accessToken)}`
                : `${baseUrl}/sse/subscribe/${userId}`;

            let es: EventSource;
            try {
                es = new EventSource(sseUrl, { withCredentials: true });
            } catch {
                return;
            }

            esRef.current = es;

            es.onopen = () => {
                if (!isMountedRef.current) {
                    return;
                }
                setIsConnected(true);
                reconnectAttemptRef.current = 0;
            };

            es.addEventListener("new-order", (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (notification) {
                    onNewOrderRef.current?.(notification);
                }
            });

            es.addEventListener("ORDER_NOTIFICATION", (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (notification) {
                    dispatchNotification(
                        notification,
                        onNewOrderRef.current,
                        onOrderStatusUpdateRef.current,
                        onPaymentStatusUpdateRef.current,
                    );
                }
            });

            es.addEventListener("order-status-updated", (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (notification) {
                    dispatchNotification(
                        notification,
                        onNewOrderRef.current,
                        onOrderStatusUpdateRef.current,
                        onPaymentStatusUpdateRef.current,
                    );
                }
            });

            es.onmessage = (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (!notification) return;

                dispatchNotification(
                    notification,
                    onNewOrderRef.current,
                    onOrderStatusUpdateRef.current,
                    onPaymentStatusUpdateRef.current,
                );
            };

            es.onerror = () => {
                if (!isMountedRef.current || esRef.current !== es) {
                    return;
                }
                if (es.readyState === EventSource.CONNECTING) {
                    return;
                }

                setIsConnected(false);
                closeEventSource();

                if (!isMountedRef.current) {
                    return;
                }

                const delay = getReconnectDelay(reconnectAttemptRef.current);
                reconnectAttemptRef.current += 1;
                if (reconnectAttemptRef.current > 8) {
                    return;
                }
                if (reconnectTimerRef.current !== null) {
                    return;
                }
                reconnectTimerRef.current = setTimeout(() => {
                    reconnectTimerRef.current = null;
                    if (isMountedRef.current) {
                        connect();
                    }
                }, delay);
            };
        };

        connect();

        return () => {
            isMountedRef.current = false;

            if (reconnectTimerRef.current !== null) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }

            closeEventSource();
            setIsConnected(false);
            reconnectAttemptRef.current = 0;
        };
    }, [isMerchantSocket, userId, restaurantId]);

    return {
        isConnected,
        socket: null,
    };
}
