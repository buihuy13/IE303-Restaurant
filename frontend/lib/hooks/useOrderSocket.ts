"use client";

import { getApiBaseUrl } from "@/lib/axios";
import { subscribeNewOrders, subscribeOrderStatusUpdates } from "@/lib/orderSSEBridge";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useRef, useState } from "react";

export interface OrderNotification {
    type: string;
    data?: {
        orderId: string;
        totalAmount?: number;
        itemCount?: number;
        customerNote?: string;
        createdAt?: string;
        status?: string;
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
}

/** Reconnect delay: starts at 2s, caps at 30s */
function getReconnectDelay(attempt: number): number {
    return Math.min(2000 * Math.pow(1.5, attempt), 30_000);
}

function parseSSEData(raw: string): OrderNotification | null {
    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;

        if (parsed.orderId && parsed.status && !parsed.data) {
            return {
                type: "ORDER_NOTIFICATION",
                data: {
                    orderId: String(parsed.orderId),
                    totalAmount: typeof parsed.totalPrice === "number" ? parsed.totalPrice : Number(parsed.totalPrice || 0),
                    itemCount: typeof parsed.itemCount === "number" ? parsed.itemCount : 1,
                    status: String(parsed.status),
                    restaurantName: String(parsed.restaurantName || ""),
                    createdAt: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date().toISOString(),
                },
                orderId: String(parsed.orderId),
                status: String(parsed.status),
                timestamp: parsed.timestamp ? new Date(parsed.timestamp as string) : new Date(),
            };
        }

        return {
            type: typeof parsed.type === "string" ? parsed.type : "unknown",
            data:
                parsed.data && typeof parsed.data === "object"
                    ? (parsed.data as OrderNotification["data"])
                    : undefined,
            orderId: typeof parsed.orderId === "string" ? parsed.orderId : undefined,
            status: typeof parsed.status === "string" ? parsed.status : undefined,
            previousStatus: typeof parsed.previousStatus === "string" ? parsed.previousStatus : undefined,
            paymentStatus: typeof parsed.paymentStatus === "string" ? parsed.paymentStatus : undefined,
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
) {
    const status = (notification.status || notification.data?.status || "").toLowerCase();

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
export function useOrderSocket({ restaurantId, userId, onNewOrder, onOrderStatusUpdate }: UseOrderSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const esRef = useRef<EventSource | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef(0);
    const isMountedRef = useRef(false);
    const onNewOrderRef = useRef(onNewOrder);
    const onOrderStatusUpdateRef = useRef(onOrderStatusUpdate);

    onNewOrderRef.current = onNewOrder;
    onOrderStatusUpdateRef.current = onOrderStatusUpdate;

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
            dispatchNotification(notification, onNewOrderRef.current, onOrderStatusUpdateRef.current);
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
                    dispatchNotification(notification, onNewOrderRef.current, onOrderStatusUpdateRef.current);
                }
            });

            es.addEventListener("order-status-updated", (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (notification) {
                    onOrderStatusUpdateRef.current?.(notification);
                }
            });

            es.onmessage = (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (!notification) return;

                dispatchNotification(notification, onNewOrderRef.current, onOrderStatusUpdateRef.current);
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
