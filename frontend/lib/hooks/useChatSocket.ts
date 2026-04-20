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
}

interface Subscription {
    roomId: string;
    unsubscribe: () => void;
}

/**
 * Global WebSocket connection hook
 * - Connect when user logs in
 * - Disconnect when user logs out
 * - Manage room subscriptions separately
 */
export function useChatSocket({ userId, isAuthenticated }: UseChatSocketOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const subscriptionsRef = useRef<Map<string, Subscription>>(new Map());
    const isConnectingRef = useRef<boolean>(false);
    const shouldReconnectRef = useRef<boolean>(false);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef<number>(0);
    const messageHandlersRef = useRef<Map<string, (message: MessageDTO) => void>>(new Map());

    // Connect WebSocket when user is authenticated
    const connect = useCallback(async (): Promise<boolean> => {
        if (!userId || !isAuthenticated || isConnectingRef.current) {
            return false;
        }

        // Don't reconnect if already connected
        if (clientRef.current?.connected) {
            setIsConnected(true);
            return true;
        }

        isConnectingRef.current = true;

        try {
            const clearReconnectTimer = () => {
                if (reconnectTimerRef.current) {
                    clearTimeout(reconnectTimerRef.current);
                    reconnectTimerRef.current = null;
                }
            };
            const scheduleReconnect = () => {
                if (!shouldReconnectRef.current || reconnectTimerRef.current) {
                    return;
                }
                const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
                reconnectAttemptRef.current += 1;
                reconnectTimerRef.current = setTimeout(() => {
                    reconnectTimerRef.current = null;
                    void connect();
                }, delayMs);
            };
            const wsOrigin = toWebSocketOrigin(WS_BASE_URL);
            // Chat-service handshake requires a one-time token query param.
            const tokenResponse = await chatApi.getOneTimeToken(userId ?? "");
            const oneTimeToken = tokenResponse.data?.message?.trim();
            if (!oneTimeToken) {
                throw new Error("Missing one-time token for chat WebSocket handshake");
            }
            const wsUrl = `${wsOrigin}/ws?token=${encodeURIComponent(oneTimeToken)}`;

            const client = new Client({
                webSocketFactory: () => {
                    return new WebSocket(wsUrl);
                },
                reconnectDelay: 0,
                // Server sends heartbeat every 20s, expects client response within 30s
                // Client will automatically send heartbeat every 25s to keep connection alive
                heartbeatIncoming: 20000, // Expect heartbeat from server every 20s
                heartbeatOutgoing: 25000, // Send heartbeat to server every 25s (automatic)
                // Disable automatic reconnect on error (we handle it manually)
                // But keep it for network issues
                connectionTimeout: 5000,
                onConnect: () => {
                    setIsConnected(true);
                    isConnectingRef.current = false;
                    reconnectAttemptRef.current = 0;
                    clearReconnectTimer();

                    // Re-subscribe to all rooms that were subscribed before
                    const roomsToResubscribe = Array.from(subscriptionsRef.current.keys());
                    roomsToResubscribe.forEach((roomId) => {
                        if (!clientRef.current?.connected) return;

                        const destination = `/topic/room/${roomId}`;

                        const handler = messageHandlersRef.current.get(roomId);
                        if (handler) {
                            try {
                                const newSub = clientRef.current.subscribe(destination, (message: IMessage) => {
                                    try {
                                        const messageData: MessageDTO = JSON.parse(message.body);
                                        handler(messageData);
                                    } catch {
                                        // Silent error handling
                                    }
                                });
                                subscriptionsRef.current.set(roomId, {
                                    roomId,
                                    unsubscribe: newSub.unsubscribe,
                                });
                            } catch {
                                // Silent error handling
                            }
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error("❌ STOMP error:", frame);
                    setIsConnected(false);
                    isConnectingRef.current = false;
                    scheduleReconnect();
                },
                onWebSocketClose: (event) => {
                    void event;
                    setIsConnected(false);
                    isConnectingRef.current = false;
                    scheduleReconnect();
                },
                onDisconnect: () => {
                    setIsConnected(false);
                    isConnectingRef.current = false;
                },
            });

            clientRef.current = client;
            client.activate();
            return true;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 503) {
                console.warn("[chat-socket] chat service unavailable, retrying connection");
            } else {
                console.warn("[chat-socket] failed to connect", error);
            }
            setIsConnected(false);
            isConnectingRef.current = false;
            if (shouldReconnectRef.current && !reconnectTimerRef.current) {
                const delayMs = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
                reconnectAttemptRef.current += 1;
                reconnectTimerRef.current = setTimeout(() => {
                    reconnectTimerRef.current = null;
                    void connect();
                }, delayMs);
            }
            return false;
        }
    }, [userId, isAuthenticated]);

    // Disconnect WebSocket when user logs out
    const disconnect = useCallback(() => {
        setIsConnected(false); // Set to false immediately
        isConnectingRef.current = false;
        shouldReconnectRef.current = false;
        reconnectAttemptRef.current = 0;
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        if (clientRef.current) {
            // Unsubscribe from all rooms first
            subscriptionsRef.current.forEach((sub) => {
                try {
                    sub.unsubscribe();
                } catch {
                    // Silent error handling
                }
            });
            subscriptionsRef.current.clear();
            messageHandlersRef.current.clear();

            // Disconnect client
            try {
                clientRef.current.deactivate();
            } catch {
                // Silent error handling
            }
            clientRef.current = null;
        }
    }, []);

    // Subscribe to a specific room
    const subscribeRoom = useCallback((roomId: string, onMessageReceived: (message: MessageDTO) => void) => {
        if (!roomId) {
            return () => {}; // Return empty unsubscribe function
        }

        // If already subscribed, just update handler
        if (subscriptionsRef.current.has(roomId)) {
            messageHandlersRef.current.set(roomId, onMessageReceived);
            return subscriptionsRef.current.get(roomId)!.unsubscribe;
        }

        // If not connected yet, store handler and subscribe when connected
        messageHandlersRef.current.set(roomId, onMessageReceived);

        if (!clientRef.current?.connected) {
            return () => {
                subscriptionsRef.current.delete(roomId);
                messageHandlersRef.current.delete(roomId);
            };
        }

        const destination = `/topic/room/${roomId}`;

        try {
            const subscription = clientRef.current.subscribe(destination, (message: IMessage) => {
                try {
                    const messageData: MessageDTO = JSON.parse(message.body);

                    // Call the stored handler for this room
                    const storedHandler = messageHandlersRef.current.get(roomId);
                    if (storedHandler) {
                        storedHandler(messageData);
                    } else {
                        // Fallback: call the passed handler if stored handler not found
                        onMessageReceived(messageData);
                    }
                } catch {
                    // Silent error handling
                }
            });

            subscriptionsRef.current.set(roomId, {
                roomId,
                unsubscribe: subscription.unsubscribe,
            });

            return subscription.unsubscribe;
        } catch {
            return () => {};
        }
    }, []);

    // Unsubscribe from a specific room
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

    // Send message to a room
    const sendMessage = useCallback(
        (roomId: string, content: string, receiverId: string): boolean => {
            if (!clientRef.current?.connected || !userId) {
                return false;
            }

            const message: MessageDTO = {
                roomId,
                senderId: userId,
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
                // Silent error handling
                return false;
            }
        },
        [userId],
    );

    // Connect when user is authenticated, disconnect when logged out
    useEffect(() => {
        if (isAuthenticated && userId) {
            shouldReconnectRef.current = true;
            void connect();
        } else {
            // Immediately set to false if not authenticated
            setIsConnected(false);
            disconnect();
        }

        return () => {
            // Cleanup on unmount - only disconnect if not authenticated
            if (!isAuthenticated) {
                setIsConnected(false);
                disconnect();
            }
        };
        // Only depend on isAuthenticated and userId, not on connect/disconnect functions
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, userId]);

    return {
        isConnected,
        subscribeRoom,
        unsubscribeRoom,
        sendMessage,
        connect,
        disconnect,
    };
}
