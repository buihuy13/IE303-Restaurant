"use client";

import { MessageDTO } from "@/types";
import { Client, IMessage } from "@stomp/stompjs";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { chatApi } from "../api/chatApi";
import { WS_BASE_URL, toWebSocketOrigin } from "../config/publicRuntime";

interface UseChatSocketOptions {
    userId: string | null;
    isAuthenticated: boolean;
    /** When false, no WebSocket connection or one-time-token requests are made. */
    enabled?: boolean;
}

const MAX_RECONNECT_ATTEMPTS = 8;

const normalizeRoomId = (roomId: string) => String(roomId).trim();

const parseMessagePayload = (body: string): MessageDTO | null => {
    try {
        const raw = JSON.parse(body) as MessageDTO;
        if (!raw?.roomId || !raw?.senderId || !raw?.receiverId) {
            return null;
        }
        return {
            ...raw,
            roomId: normalizeRoomId(raw.roomId),
            senderId: String(raw.senderId).trim(),
            receiverId: String(raw.receiverId).trim(),
            content: String(raw.content ?? ""),
        };
    } catch {
        return null;
    }
};

interface Subscription {
    roomId: string;
    unsubscribe: () => void;
    isActive?: boolean;
}

/**
 * Chat WebSocket hook — only connects when `enabled` is true (chat screens).
 */
export function useChatSocket({ userId, isAuthenticated, enabled = false }: UseChatSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());
    const isConnectingRef = useRef<boolean>(false);
    const shouldReconnectRef = useRef<boolean>(false);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef<number>(0);
    const messageHandlersRef = useRef<Map<string, (message: MessageDTO) => void>>(new Map());
    const isMountedRef = useRef<boolean>(false);
    const connectionSessionRef = useRef<number>(0);
    const tokenAbortRef = useRef<AbortController | null>(null);

    const enabledRef = useRef(enabled);
    const userIdRef = useRef(userId);
    const isAuthenticatedRef = useRef(isAuthenticated);
    enabledRef.current = enabled;
    userIdRef.current = userId;
    isAuthenticatedRef.current = isAuthenticated;

    const isConnectionAllowed = (sessionId: number) =>
        isMountedRef.current &&
        enabledRef.current &&
        shouldReconnectRef.current &&
        sessionId === connectionSessionRef.current &&
        !!userIdRef.current &&
        isAuthenticatedRef.current;

    const deactivateClient = useCallback((clearHandlers: boolean) => {
        subscriptionsRef.current.forEach((sub) => {
            try {
                sub.unsubscribe();
            } catch {
                // Silent error handling
            }
        });
        subscriptionsRef.current.clear();

        if (clearHandlers) {
            messageHandlersRef.current.clear();
        }

        const client = clientRef.current;
        clientRef.current = null;

        if (client) {
            try {
                client.deactivate();
            } catch {
                // Silent error handling
            }
        }
    }, []);

    const activateRoomSubscriptions = useCallback(() => {
        if (!clientRef.current?.connected) {
            return;
        }

        messageHandlersRef.current.forEach((handler, roomId) => {
            const normalizedRoomId = normalizeRoomId(roomId);
            const destination = `/topic/room/${normalizedRoomId}`;

            try {
                const existing = subscriptionsRef.current.get(normalizedRoomId);
                if (existing?.isActive) {
                    return;
                }

                const subscription = clientRef.current!.subscribe(destination, (message: IMessage) => {
                    const messageData = parseMessagePayload(message.body);
                    if (!messageData) {
                        return;
                    }
                    const storedHandler = messageHandlersRef.current.get(normalizedRoomId);
                    storedHandler?.(messageData);
                });

                subscriptionsRef.current.set(normalizedRoomId, {
                    roomId: normalizedRoomId,
                    unsubscribe: subscription.unsubscribe,
                    isActive: true,
                });
            } catch {
                // Silent error handling
            }
        });
    }, []);

    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;

        tokenAbortRef.current?.abort();
        tokenAbortRef.current = null;

        setIsConnected(false);
        isConnectingRef.current = false;
        reconnectAttemptRef.current = 0;

        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        deactivateClient(true);
    }, [deactivateClient]);

    const connectInternal = useCallback(async (sessionId: number): Promise<boolean> => {
        if (!isConnectionAllowed(sessionId) || isConnectingRef.current) {
            return false;
        }

        if (clientRef.current?.connected) {
            setIsConnected(true);
            return true;
        }

        isConnectingRef.current = true;

        const clearReconnectTimer = () => {
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
        };

        const scheduleReconnect = () => {
            if (!isConnectionAllowed(sessionId) || reconnectTimerRef.current) {
                return;
            }
            if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
                console.warn("[chat-socket] max reconnect attempts reached, giving up");
                return;
            }
            const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
            reconnectAttemptRef.current += 1;
            reconnectTimerRef.current = setTimeout(() => {
                reconnectTimerRef.current = null;
                void connectInternal(sessionId);
            }, delayMs);
        };

        tokenAbortRef.current?.abort();
        const abortController = new AbortController();
        tokenAbortRef.current = abortController;

        try {
            const wsOrigin = toWebSocketOrigin(WS_BASE_URL);
            const tokenResponse = await chatApi.getOneTimeToken(userIdRef.current ?? "", {
                signal: abortController.signal,
            });

            if (abortController.signal.aborted || !isConnectionAllowed(sessionId)) {
                isConnectingRef.current = false;
                return false;
            }

            const oneTimeToken = tokenResponse.data?.message?.trim();
            if (!oneTimeToken) {
                throw new Error("Missing one-time token for chat WebSocket handshake");
            }

            if (!isConnectionAllowed(sessionId)) {
                isConnectingRef.current = false;
                return false;
            }

            const wsUrl = `${wsOrigin}/ws?token=${encodeURIComponent(oneTimeToken)}`;

            const client = new Client({
                webSocketFactory: () => new WebSocket(wsUrl),
                reconnectDelay: 0,
                heartbeatIncoming: 20000,
                heartbeatOutgoing: 25000,
                connectionTimeout: 5000,
                onConnect: () => {
                    if (!isConnectionAllowed(sessionId)) {
                        return;
                    }
                    setIsConnected(true);
                    isConnectingRef.current = false;
                    reconnectAttemptRef.current = 0;
                    clearReconnectTimer();

                    activateRoomSubscriptions();
                },
                onStompError: (frame) => {
                    console.error("❌ STOMP error:", frame);
                    setIsConnected(false);
                    isConnectingRef.current = false;
                    scheduleReconnect();
                },
                onWebSocketClose: () => {
                    setIsConnected(false);
                    isConnectingRef.current = false;
                    subscriptionsRef.current.forEach((sub) => {
                        try {
                            sub.unsubscribe();
                        } catch {
                            // Silent error handling
                        }
                    });
                    subscriptionsRef.current.clear();
                    if (!clientRef.current) {
                        return;
                    }
                    scheduleReconnect();
                },
                onDisconnect: () => {
                    setIsConnected(false);
                    isConnectingRef.current = false;
                },
            });

            if (!isConnectionAllowed(sessionId)) {
                isConnectingRef.current = false;
                return false;
            }

            if (clientRef.current && clientRef.current !== client) {
                try {
                    await clientRef.current.deactivate();
                } catch {
                    // Silent error handling
                }
            }

            clientRef.current = client;
            client.activate();
            return true;
        } catch (error) {
            if (axios.isCancel(error)) {
                isConnectingRef.current = false;
                return false;
            }
            if (axios.isAxiosError(error) && error.response?.status === 503) {
                console.warn("[chat-socket] chat service unavailable, retrying connection");
            } else {
                console.warn("[chat-socket] failed to connect", error);
            }
            setIsConnected(false);
            isConnectingRef.current = false;
            if (isConnectionAllowed(sessionId) && !reconnectTimerRef.current && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
                const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
                reconnectAttemptRef.current += 1;
                reconnectTimerRef.current = setTimeout(() => {
                    reconnectTimerRef.current = null;
                    void connectInternal(sessionId);
                }, delayMs);
            }
            return false;
        } finally {
            if (tokenAbortRef.current === abortController) {
                tokenAbortRef.current = null;
            }
        }
    }, [activateRoomSubscriptions]);

    const connect = useCallback(async (): Promise<boolean> => {
        if (!enabledRef.current || !userIdRef.current || !isAuthenticatedRef.current || !isMountedRef.current) {
            return false;
        }
        shouldReconnectRef.current = true;
        return connectInternal(connectionSessionRef.current);
    }, [connectInternal]);

    const subscribeRoom = useCallback(
        (roomId: string, onMessageReceived: (message: MessageDTO) => void) => {
            if (!roomId) {
                return () => {};
            }

            const normalizedRoomId = normalizeRoomId(roomId);

            const removeSubscription = () => {
                const activeSubscription = subscriptionsRef.current.get(normalizedRoomId);
                if (activeSubscription?.isActive) {
                    try {
                        activeSubscription.unsubscribe();
                    } catch {
                        // Silent error handling
                    }
                }
                subscriptionsRef.current.delete(normalizedRoomId);
                messageHandlersRef.current.delete(normalizedRoomId);
            };

            messageHandlersRef.current.set(normalizedRoomId, onMessageReceived);

            if (!clientRef.current?.connected) {
                subscriptionsRef.current.set(normalizedRoomId, {
                    roomId: normalizedRoomId,
                    unsubscribe: () => {
                        subscriptionsRef.current.delete(normalizedRoomId);
                    },
                    isActive: false,
                });
                return removeSubscription;
            }

            activateRoomSubscriptions();
            return removeSubscription;
        },
        [activateRoomSubscriptions],
    );

    const unsubscribeRoom = useCallback((roomId: string) => {
        const subscription = subscriptionsRef.current.get(roomId);
        if (subscription) {
            try {
                subscription.unsubscribe();
                subscriptionsRef.current.delete(roomId);
                messageHandlersRef.current.delete(roomId);
            } catch {
                // Silent error handling
            }
        }
    }, []);

    const sendMessage = useCallback(
        (roomId: string, content: string, receiverId: string): boolean => {
            if (!clientRef.current?.connected || !userIdRef.current) {
                return false;
            }

            const message: MessageDTO = {
                roomId: normalizeRoomId(roomId),
                senderId: userIdRef.current,
                receiverId,
                content,
            };

            try {
                clientRef.current.publish({
                    destination: "/app/chat.sendMessage",
                    body: JSON.stringify(message),
                });
                void content;
                return true;
            } catch {
                return false;
            }
        },
        [],
    );

    useEffect(() => {
        isMountedRef.current = true;

        if (!enabled || !isAuthenticated || !userId) {
            connectionSessionRef.current += 1;
            disconnect();
            return () => {
                isMountedRef.current = false;
                connectionSessionRef.current += 1;
                disconnect();
            };
        }

        const sessionId = ++connectionSessionRef.current;
        shouldReconnectRef.current = true;
        void connectInternal(sessionId);

        return () => {
            isMountedRef.current = false;
            connectionSessionRef.current += 1;
            disconnect();
        };
    }, [enabled, isAuthenticated, userId, connectInternal, disconnect]);

    return {
        isConnected,
        subscribeRoom,
        unsubscribeRoom,
        sendMessage,
        connect,
        disconnect,
        resubscribeAllRooms: activateRoomSubscriptions,
    };
}
