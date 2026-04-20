"use client";

import { useNotificationStore } from "@/stores/useNotificationStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { NOTIFICATION_SSE_ORIGIN } from "../config/publicRuntime";

const NOTIFICATION_URL = NOTIFICATION_SSE_ORIGIN;
const SSE_PROBE_TIMEOUT_MS = 3000;
const MAX_RETRY_ATTEMPTS = 8;

interface UseSSEOptions {
    userId: string | null;
    isAuthenticated: boolean;
}

type NotificationEventPayload = {
    title?: string;
    message?: string;
    type?: string;
    status?: string;
    orderId?: string;
    restaurantName?: string;
    reason?: string;
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
    const normalizedStatus = normalizeText(payload.status).toLowerCase();

    const matched = [normalizedType, normalizedStatus, normalizedEvent].find(Boolean) ?? "";

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

    const log = (...args: unknown[]) => {
        console.log("[sse-notification]", ...args);
    };

    const closeCurrentEventSource = () => {
        const currentEventSource = eventSourceRef.current;
        if (!currentEventSource) {
            return;
        }
        currentEventSource.close();
        eventSourceRef.current = null;
    };

    const getSseEndpoints = (encodedUserId: string) => [
        // Backend exposes the correct subscribe route only.
        `${NOTIFICATION_URL}/api/sse/subscribe/${encodedUserId}`,
    ];

    const probeSseUrl = async (
        url: string,
    ): Promise<{ ok: boolean; status?: number; reason?: "http" | "network" | "timeout" }> => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), SSE_PROBE_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: { Accept: "text/event-stream" },
                credentials: "include",
                cache: "no-store",
                signal: controller.signal,
            });
            clearTimeout(timer);
            // We only probe headers/status, do not keep this stream open.
            void response.body?.cancel();
            return response.ok ? { ok: true } : { ok: false, status: response.status, reason: "http" };
        } catch (error) {
            clearTimeout(timer);
            if ((error as { name?: string })?.name === "AbortError") {
                return { ok: false, reason: "timeout" };
            }
            return { ok: false, reason: "network" };
        }
    };

    const resolveReachableSseUrl = async (
        encodedUserId: string,
    ): Promise<{ url: string | null; statuses: number[]; reasons: string[] }> => {
        const endpoints = getSseEndpoints(encodedUserId);
        const statuses: number[] = [];
        const reasons: string[] = [];

        for (const endpoint of endpoints) {
            const result = await probeSseUrl(endpoint);
            if (result.ok) {
                return { url: endpoint, statuses, reasons };
            }
            if (typeof result.status === "number") {
                statuses.push(result.status);
            }
            if (result.reason) {
                reasons.push(result.reason);
            }
        }

        return { url: null, statuses, reasons };
    };

    const connect = async () => {
        const currentUserId = userId;
        if (!currentUserId || !isAuthenticated) {
            log("skip connect: missing user/auth", { currentUserId, isAuthenticated });
            return;
        }

        if (isConnectingRef.current) {
            return;
        }

        // Don't reconnect if already connected
        if (eventSourceRef.current?.readyState === EventSource.OPEN) {
            setIsConnected(true);
            log("already connected");
            return;
        }

        isConnectingRef.current = true;
        // Close existing connection if any
        closeCurrentEventSource();

        try {
            const encodedUserId = encodeURIComponent(currentUserId ?? "");
            const { url: sseUrl, statuses, reasons } = await resolveReachableSseUrl(encodedUserId);
            if (!sseUrl) {
                setIsConnected(false);
                isConnectingRef.current = false;

                const statusText = statuses.length > 0 ? `HTTP ${Array.from(new Set(statuses)).join("/")}` : null;
                const reasonText = reasons.length > 0 ? reasons.join(", ") : "unreachable";
                console.warn("SSE endpoint probe failed.", {
                    endpointsTried: getSseEndpoints(encodedUserId),
                    statusText,
                    reasonText,
                });

                // Inform user once per disconnected period instead of spamming.
                if (!unavailableToastShownRef.current) {
                    unavailableToastShownRef.current = true;
                    toast.error(
                        statusText
                            ? `Notification service unavailable (${statusText}).`
                            : "Notification service unavailable right now.",
                        { duration: 5000 },
                    );
                }

                const nextAttempt = retryAttemptRef.current + 1;
                retryAttemptRef.current = nextAttempt;
                if (nextAttempt <= MAX_RETRY_ATTEMPTS && isAuthenticated && userId) {
                    const retryDelay = Math.min(2000 * nextAttempt, 15000);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        void connect();
                    }, retryDelay);
                }
                return;
            }

            log("connecting", { sseUrl });

            const eventSource = new EventSource(sseUrl);

            eventSource.onopen = () => {
                setIsConnected(true);
                isConnectingRef.current = false;
                retryAttemptRef.current = 0;
                unavailableToastShownRef.current = false;
                log("connected");

                // Clear any pending reconnect
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            eventSource.onerror = () => {
                const activeState = eventSource.readyState;
                const online = typeof navigator === "undefined" ? true : navigator.onLine;
                const nextAttempt = retryAttemptRef.current + 1;
                retryAttemptRef.current = nextAttempt;
                const retryDelay = Math.min(2000 * nextAttempt, 15000);
                const details = {
                    url: sseUrl,
                    readyState: activeState,
                    online,
                    nextAttempt,
                    retryDelayMs: retryDelay,
                };

                // EventSource exposes minimal error details (usually empty Event object),
                // so log extra transport context instead of a generic "{}".
                console.warn("SSE connection closed, scheduling reconnect.", details);
                log("error", details);
                setIsConnected(false);
                isConnectingRef.current = false;

                // Close connection
                closeCurrentEventSource();

                // Reconnect with capped backoff while authenticated.
                if (nextAttempt <= MAX_RETRY_ATTEMPTS && isAuthenticated && userId) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        void connect();
                    }, retryDelay);
                }
            };

            // Handle INIT event (connection confirmation)
            eventSource.addEventListener("INIT", (event) => {
                log("INIT", event.data);
            });

            // Handle PING event (heartbeat)
            eventSource.addEventListener("PING", () => {
                log("PING");
            });

            const handleOrderEvent = (eventName: string, data: string) => {
                const payload = parsePayload(data);
                const config = resolveOrderNotificationType(eventName, payload);
                const fallbackMessage = normalizeText(payload.message) || config.fallbackMessage;
                const resolvedMessage = payload.orderId
                    ? `Order ${payload.orderId}: ${fallbackMessage}`
                    : fallbackMessage;

                const dedupeKey = `${config.type}-${payload.orderId ?? "unknown"}-${resolvedMessage}`;
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
            ].forEach((eventName) => {
                eventSource.addEventListener(eventName, (event) => {
                    log(eventName, event.data);
                    handleOrderEvent(eventName, event.data);
                });
            });

            // Fallback for providers that send unnamed events.
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

    const disconnect = () => {
        log("disconnect");
        setIsConnected(false);
        isConnectingRef.current = false;
        retryAttemptRef.current = 0;
        unavailableToastShownRef.current = false;

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        closeCurrentEventSource();
    };

    // Connect when user is authenticated, disconnect when logged out
    useEffect(() => {
        if (isAuthenticated && userId) {
            void connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, userId]);

    return {
        isConnected,
        connect,
        disconnect,
    };
}
