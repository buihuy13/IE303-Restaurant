"use client";

import { useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";

export interface OrderNotification {
    type: string;
    // For new-order event
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
    // For order-status-updated event (fields at root level)
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

        // If it's a flat payload from Java's ORDER_NOTIFICATION event
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

export function useOrderSocket({ userId, onNewOrder, onOrderStatusUpdate }: UseOrderSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const esRef = useRef<EventSource | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef(0);
    const isMountedRef = useRef(true);

    const onNewOrderRef = useRef<UseOrderSocketOptions["onNewOrder"]>(onNewOrder);
    const onOrderStatusUpdateRef = useRef<UseOrderSocketOptions["onOrderStatusUpdate"]>(onOrderStatusUpdate);

    useEffect(() => {
        onNewOrderRef.current = onNewOrder;
    }, [onNewOrder]);

    useEffect(() => {
        onOrderStatusUpdateRef.current = onOrderStatusUpdate;
    }, [onOrderStatusUpdate]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        // Chỉ kết nối SSE khi có userId (merchant đã đăng nhập)
        if (!userId) {
            setIsConnected(false);
            return;
        }

        const connect = () => {
            if (!isMountedRef.current) return;

            // Đóng kết nối cũ nếu còn
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }

            // Lấy access token từ auth store để truyền qua query param
            // vì EventSource không hỗ trợ custom Authorization header
            const accessToken = useAuthStore.getState().accessToken;
            const baseUrl = getApiBaseUrl().replace(/\/+$/, "");
            const sseUrl = accessToken
                ? `${baseUrl}/sse/subscribe/${userId}?token=${encodeURIComponent(accessToken)}`
                : `${baseUrl}/sse/subscribe/${userId}`;

            let es: EventSource;
            try {
                es = new EventSource(sseUrl, { withCredentials: true });
            } catch {
                // EventSource không khả dụng (SSR hoặc môi trường không hỗ trợ)
                return;
            }

            esRef.current = es;

            es.onopen = () => {
                if (!isMountedRef.current) return;
                setIsConnected(true);
                reconnectAttemptRef.current = 0;
                if (process.env.NODE_ENV === "development") {
                    console.info("[useOrderSocket] SSE connected for userId:", userId);
                }
            };

            // Lắng nghe event "new-order" từ notification-service
            es.addEventListener("new-order", (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (notification) {
                    onNewOrderRef.current?.(notification);
                }
            });

            // Lắng nghe event "ORDER_NOTIFICATION" từ Java SSEService
            es.addEventListener("ORDER_NOTIFICATION", (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (notification) {
                    if (notification.status === "PENDING" || notification.status === "pending") {
                        onNewOrderRef.current?.(notification);
                    } else {
                        onOrderStatusUpdateRef.current?.(notification);
                    }
                }
            });

            // Lắng nghe event "order-status-updated"
            es.addEventListener("order-status-updated", (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (notification) {
                    onOrderStatusUpdateRef.current?.(notification);
                }
            });

            // Fallback: lắng nghe message chung (không có tên event cụ thể)
            es.onmessage = (event: MessageEvent<string>) => {
                if (!isMountedRef.current) return;
                const notification = parseSSEData(event.data);
                if (!notification) return;

                if (notification.type === "new-order" || notification.type === "NEW_ORDER") {
                    onNewOrderRef.current?.(notification);
                } else if (
                    notification.type === "order-status-updated" ||
                    notification.type === "ORDER_STATUS_UPDATED"
                ) {
                    onOrderStatusUpdateRef.current?.(notification);
                }
            };

            es.onerror = () => {
                if (!isMountedRef.current) return;
                setIsConnected(false);
                es.close();
                esRef.current = null;

                // Tự động reconnect với exponential backoff
                const delay = getReconnectDelay(reconnectAttemptRef.current);
                reconnectAttemptRef.current += 1;
                if (process.env.NODE_ENV === "development") {
                    console.warn(
                        `[useOrderSocket] SSE error, reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})`,
                    );
                }
                reconnectTimerRef.current = setTimeout(() => {
                    if (isMountedRef.current) connect();
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
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
            setIsConnected(false);
            // Reset mounted flag cho lần mount tiếp theo
            isMountedRef.current = true;
        };
    }, [userId]);

    return {
        isConnected,
        /** @deprecated socket.io không còn dùng, luôn là null */
        socket: null,
    };
}
