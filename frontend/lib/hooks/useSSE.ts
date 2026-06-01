"use client";

import { emitOrderStatusUpdate, orderNotificationFromSSEPayload, type OrderSSEPayload } from "@/lib/orderSSEBridge";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { NOTIFICATION_SSE_ORIGIN } from "../config/publicRuntime";

const NOTIFICATION_URL = NOTIFICATION_SSE_ORIGIN;
const MAX_RETRY_ATTEMPTS = 5;
const ORDER_LIFECYCLE_STATUSES = new Set(["pending", "confirmed", "preparing", "ready", "delivering", "completed", "cancelled"]);
const LEGACY_ORDER_EVENT_NAMES = new Set([
    "order successfully",
    "order_accepted",
    "order_confirmed",
    "order failed",
    "order_rejected",
    "order_completed",
    "order_status_updated",
]);

interface UseSSEOptions {
    userId: string | null;
    isAuthenticated: boolean;
}

type NotificationEventPayload = OrderSSEPayload & {
    senderId?: string;
    senderName?: string;
    roomId?: string;
};

const normalizeText = (value: unknown): string => {
    if (typeof value !== "string") return "";
    return value.trim();
};

const parsePayload = (rawData: string): NotificationEventPayload => {
    if (!rawData) return {};
    try {
        const parsed = JSON.parse(rawData) as unknown;
        if (parsed && typeof parsed === "object") {
            return parsed as NotificationEventPayload;
        }
        return {};
    } catch {
        return { message: rawData };
    }
};

const resolveOrderNotificationType = (eventName: string, payload: NotificationEventPayload) => {
    const normalizedEvent = eventName.toLowerCase();
    const normalizedType = normalizeText(payload.type).toLowerCase();
    const normalizedStatus = normalizeText(payload.orderStatus || payload.status).toLowerCase();

    const matched = [normalizedStatus, normalizedType, normalizedEvent].find(Boolean) ?? "";

    if (matched.includes("reject") || matched.includes("cancel") || matched.includes("fail")) {
        return {
            type: "ORDER_REJECTED" as const,
            title: payload.title || "Order rejected",
            toastType: "error" as const,
            fallbackMessage: "Your order has been rejected.",
        };
    }

    if (matched.includes("complete") || matched.includes("delivered")) {
        return {
            type: "ORDER_COMPLETED" as const,
            title: payload.title || "Order completed",
            toastType: "success" as const,
            fallbackMessage: "Your order has been completed.",
        };
    }

    if (
        matched.includes("confirm") ||
        matched.includes("prepar") ||
        matched.includes("ready") ||
        matched.includes("deliver")
    ) {
        return {
            type: "ORDER_CONFIRMED" as const,
            title: payload.title || "Order status updated",
            toastType: "success" as const,
            fallbackMessage: "Your order status has been updated.",
        };
    }

    return {
        type: "ORDER_ACCEPTED" as const,
        title: payload.title || "Order accepted",
        toastType: "success" as const,
        fallbackMessage: "Your order has been accepted.",
    };
};

const isOrderLifecyclePayload = (eventName: string, payload: NotificationEventPayload): boolean => {
    if (normalizeText(payload.eventType).toUpperCase() === "PAYMENT_STATUS") {
        return false;
    }

    const normalizedStatus = normalizeText(payload.orderStatus || payload.status).toLowerCase();
    return ORDER_LIFECYCLE_STATUSES.has(normalizedStatus) || LEGACY_ORDER_EVENT_NAMES.has(eventName.toLowerCase());
};

/**
 * Hook to connect to SSE endpoint for order notifications
 * - Connects when user is authenticated
 * - Disconnects when user logs out
 * - Handles order accepted/rejected notifications
 */
export function useSSE({ userId, isAuthenticated }: UseSSEOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const processedEventKeysRef = useRef<Set<string>>(new Set());
    const { addNotification } = useNotificationStore();
    const isConnectingRef = useRef(false);
    const retryAttemptRef = useRef(0);
    const unavailableToastShownRef = useRef(false);
    const isMountedRef = useRef(false);

    const log = (...args: unknown[]) => {
        console.log("[sse-notification]", ...args);
    };

    const buildSseUrl = (encodedUserId: string) =>
        `${NOTIFICATION_URL}/api/sse/subscribe/${encodedUserId}`;

    useEffect(() => {
        isMountedRef.current = true;

        const closeEventSource = () => {
            const current = eventSourceRef.current;
            if (!current) {
                return;
            }
            eventSourceRef.current = null;
            current.close();
        };

        const connect = () => {
            const currentUserId = userId;
            if (!isMountedRef.current || !currentUserId || !isAuthenticated) {
                log("skip connect: missing mount/user/auth");
                return;
            }

            if (isConnectingRef.current) {
                return;
            }

            if (eventSourceRef.current?.readyState === EventSource.OPEN) {
                setIsConnected(true);
                log("already connected");
                return;
            }

            isConnectingRef.current = true;
            closeEventSource();

            try {
                const encodedUserId = encodeURIComponent(currentUserId);
                const sseUrl = buildSseUrl(encodedUserId);
                log("connecting", { sseUrl });

                const eventSource = new EventSource(sseUrl, { withCredentials: true });

                eventSource.onopen = () => {
                    if (!isMountedRef.current) {
                        return;
                    }
                    setIsConnected(true);
                    isConnectingRef.current = false;
                    retryAttemptRef.current = 0;
                    unavailableToastShownRef.current = false;
                    log("connected");

                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                        reconnectTimeoutRef.current = null;
                    }
                };

                eventSource.onerror = () => {
                    if (!isMountedRef.current || eventSourceRef.current !== eventSource) {
                        return;
                    }

                    const activeState = eventSource.readyState;
                    if (activeState === EventSource.CONNECTING) {
                        return;
                    }

                    const nextAttempt = retryAttemptRef.current + 1;
                    retryAttemptRef.current = nextAttempt;
                    const retryDelay = Math.min(5000 * nextAttempt, 30000);
                    log("error", { url: sseUrl, readyState: activeState, nextAttempt, retryDelayMs: retryDelay });
                    setIsConnected(false);
                    isConnectingRef.current = false;
                    closeEventSource();

                    if (!isMountedRef.current) {
                        return;
                    }

                    if (nextAttempt > MAX_RETRY_ATTEMPTS) {
                        if (!unavailableToastShownRef.current) {
                            unavailableToastShownRef.current = true;
                            toast.error("Notification service unavailable right now.", { duration: 5000 });
                        }
                        return;
                    }

                    if (!reconnectTimeoutRef.current) {
                        reconnectTimeoutRef.current = setTimeout(() => {
                            reconnectTimeoutRef.current = null;
                            if (isMountedRef.current) {
                                connect();
                            }
                        }, retryDelay);
                    }
                };

                eventSource.addEventListener("INIT", (event) => {
                    log("INIT", event.data);
                });

                eventSource.addEventListener("PING", () => {
                    log("PING");
                });

                const handleOrderEvent = (eventName: string, data: string) => {
                    if (!isMountedRef.current) {
                        return;
                    }

                    const payload = parsePayload(data);
                    if (!isOrderLifecyclePayload(eventName, payload)) {
                        log("ignore non-order-status event", payload);
                        return;
                    }

                    const config = resolveOrderNotificationType(eventName, payload);
                    const fallbackMessage = normalizeText(payload.message) || config.fallbackMessage;
                    const resolvedMessage = payload.orderId
                        ? `Order ${payload.orderId}: ${fallbackMessage}`
                        : fallbackMessage;

                    const dedupeKey = [
                        normalizeText(payload.eventType) || "LEGACY",
                        payload.orderId ?? "unknown",
                        normalizeText(payload.orderStatus),
                        normalizeText(payload.paymentStatus),
                        normalizeText(payload.status),
                    ].join("-");
                    if (processedEventKeysRef.current.has(dedupeKey)) {
                        return;
                    }
                    processedEventKeysRef.current.add(dedupeKey);
                    if (processedEventKeysRef.current.size > 200) {
                        const recent = Array.from(processedEventKeysRef.current).slice(-100);
                        processedEventKeysRef.current = new Set(recent);
                    }

                    addNotification({
                        type: config.type,
                        title: config.title,
                        message: resolvedMessage,
                        orderId: payload.orderId,
                        restaurantName: payload.restaurantName,
                    });

                    emitOrderStatusUpdate(orderNotificationFromSSEPayload(payload, eventName));

                    if (config.toastType === "error") {
                        toast.error(resolvedMessage, { icon: "❌", duration: 5000 });
                        return;
                    }
                    toast.success(resolvedMessage, { icon: "✅", duration: 5000 });
                };

                [
                    "Order Successfully",
                    "ORDER_ACCEPTED",
                    "ORDER_CONFIRMED",
                    "Order Failed",
                    "ORDER_REJECTED",
                    "ORDER_COMPLETED",
                    "ORDER_STATUS_UPDATED",
                    "ORDER_NOTIFICATION",
                ].forEach((eventName) => {
                    eventSource.addEventListener(eventName, (event) => {
                        log(eventName, event.data);
                        handleOrderEvent(eventName, event.data);
                    });
                });

                eventSource.onmessage = (event) => {
                    if (!event.data) return;
                    log("message", event.data);
                    handleOrderEvent("message", event.data);
                };

                eventSourceRef.current = eventSource;
            } catch (error) {
                console.error("Failed to create SSE connection:", error);
                log("failed to create EventSource", error);
                setIsConnected(false);
                isConnectingRef.current = false;
                retryAttemptRef.current += 1;
            }
        };

        if (isAuthenticated && userId) {
            connect();
        } else {
            setIsConnected(false);
            isConnectingRef.current = false;
            retryAttemptRef.current = 0;
            unavailableToastShownRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            closeEventSource();
        }

        return () => {
            isMountedRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            closeEventSource();
            setIsConnected(false);
            isConnectingRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, userId]);

    return { isConnected };
}
