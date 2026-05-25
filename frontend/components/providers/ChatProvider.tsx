"use client";

import { chatApi } from "@/lib/api/chatApi";
import { getChatAlertDedupKey, normalizeChatId, processIncomingChatAlert } from "@/lib/chat/chatNotifications";
import { useChatSocket } from "@/lib/hooks/useChatSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { ChatRoom, MessageDTO } from "@/types";
import { usePathname } from "next/navigation";
import { ReactNode, createContext, useCallback, useContext, useEffect, useRef } from "react";

interface ChatSocketContextType {
    isConnected: boolean;
    subscribeRoom: (roomId: string, onMessageReceived: (message: MessageDTO) => void) => () => void;
    unsubscribeRoom: (roomId: string) => void;
    sendMessage: (roomId: string, content: string, receiverId: string) => boolean;
    connect: () => Promise<boolean>;
    disconnect: () => void;
    onMessage?: (message: MessageDTO) => void;
}

const ChatSocketContext = createContext<ChatSocketContextType | null>(null);
const EMPTY_ROOMS_SYNC_INTERVAL_MS = 5000;
const HAS_ROOMS_SYNC_INTERVAL_MS = 5000;

const roomActivitySignature = (room: ChatRoom) => `${room.lastMessageTime ?? ""}|${room.lastMessage ?? ""}`;

export function useChatSocketContext() {
    const context = useContext(ChatSocketContext);
    if (!context) {
        throw new Error("useChatSocketContext must be used within ChatProvider");
    }
    return context;
}

interface ChatProviderProps {
    children: ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuthStore();
    const rooms = useChatStore((state) => state.rooms);
    const chatSocket = useChatSocket({
        userId: user?.id || null,
        isAuthenticated,
        enabled: isAuthenticated,
    });
    const { isConnected, subscribeRoom, resubscribeAllRooms } = chatSocket;
    const { setRooms, setRoomsHydrated, setRoomsLoadError, updateRoomLastMessage, incrementUnreadCount, setLastMessage } =
        useChatStore();
    const subscribedRoomsRef = useRef<Set<string>>(new Set());
    const reloadingRoomsRef = useRef(false);
    const processedMessagesRef = useRef<Set<string>>(new Set());
    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const syncIntervalMsRef = useRef<number>(EMPTY_ROOMS_SYNC_INTERVAL_MS);
    const roomActivitySnapshotRef = useRef<Map<string, string>>(new Map());
    const userIdRef = useRef(user?.id);
    userIdRef.current = user?.id;

    // Leaving chat clears "viewing room" so alerts work on Orders and other pages.
    useEffect(() => {
        const onChatScreen = pathname === "/chat" || pathname.startsWith("/merchant/messages");
        if (!onChatScreen) {
            useChatStore.getState().setActiveViewingRoomId(null);
        }
    }, [pathname]);

    const processIncomingMessage = useCallback(
        async (message: MessageDTO) => {
            const currentUserId = userIdRef.current;
            if (!currentUserId) {
                return;
            }

            const normalizedRoomId = String(message.roomId).trim();
            const currentRooms = useChatStore.getState().rooms;
            const incomingMessage = { ...message, roomId: normalizedRoomId };
            const messageKey = getChatAlertDedupKey(incomingMessage, currentUserId, currentRooms);

            if (processedMessagesRef.current.has(messageKey)) {
                return;
            }
            processedMessagesRef.current.add(messageKey);

            if (processedMessagesRef.current.size > 200) {
                const keysArray = Array.from(processedMessagesRef.current);
                processedMessagesRef.current = new Set(keysArray.slice(-100));
            }

            const roomExists = currentRooms.some((room) => normalizeChatId(room.id) === normalizeChatId(normalizedRoomId));

            if (!roomExists && !reloadingRoomsRef.current) {
                reloadingRoomsRef.current = true;
                try {
                    const response = await chatApi.getAllRoomsByUserId(currentUserId);
                    const updatedRooms: ChatRoom[] = response.data?.content || [];
                    setRooms(updatedRooms);
                } catch {
                    // Silent error handling
                } finally {
                    reloadingRoomsRef.current = false;
                }
            }

            updateRoomLastMessage(
                normalizedRoomId,
                message.content,
                message.timestamp || new Date().toISOString(),
            );
            setLastMessage(normalizedRoomId, { ...message, roomId: normalizedRoomId });

            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("chat-message-received", {
                        detail: { ...message, roomId: normalizedRoomId },
                    }),
                );
            }

            const roomsForUnread = useChatStore.getState().rooms;
            if (await processIncomingChatAlert(incomingMessage, currentUserId, roomsForUnread, messageKey)) {
                incrementUnreadCount(normalizedRoomId);
            }

        },
        [incrementUnreadCount, setLastMessage, setRooms, updateRoomLastMessage],
    );

    const processIncomingMessageRef = useRef(processIncomingMessage);
    processIncomingMessageRef.current = processIncomingMessage;

    const subscribeAllRooms = useCallback(() => {
        if (!userIdRef.current) {
            return;
        }

        const handler = (message: MessageDTO) => {
            void processIncomingMessageRef.current(message);
        };

        useChatStore.getState().rooms.forEach((room) => {
            const roomId = String(room.id).trim();
            subscribeRoom(roomId, handler);
            subscribedRoomsRef.current.add(roomId);
        });

        if (isConnected) {
            resubscribeAllRooms();
        }
    }, [isConnected, subscribeRoom, resubscribeAllRooms]);

    // Poll rooms and subscribe; detect new activity via room list when websocket misses an event.
    useEffect(() => {
        if (!user?.id || !isAuthenticated) {
            return;
        }

        const syncRoomsAndSubscriptions = async () => {
            try {
                const response = await chatApi.getAllRoomsByUserId(user.id);
                const fetchedRooms: ChatRoom[] = response.data?.content || [];
                setRooms(fetchedRooms);
                setRoomsLoadError(null);
                setRoomsHydrated(true);

                const changedRoomIds: string[] = [];
                for (const room of fetchedRooms) {
                    const signature = roomActivitySignature(room);
                    const previous = roomActivitySnapshotRef.current.get(room.id);
                    if (previous !== undefined && previous !== signature && room.lastMessage) {
                        changedRoomIds.push(room.id);
                    }
                    roomActivitySnapshotRef.current.set(room.id, signature);
                }

                for (const roomId of changedRoomIds) {
                    try {
                        const messagesResponse = await chatApi.getMessagesByRoomId(roomId, 0, 1);
                        const latest = messagesResponse.data?.content?.[0];
                        if (!latest) {
                            continue;
                        }
                        await processIncomingMessageRef.current({
                            roomId: latest.roomId || latest.room?.id || roomId,
                            senderId: latest.senderId,
                            receiverId: latest.receiverId,
                            content: latest.content,
                            timestamp: latest.timestamp,
                        });
                    } catch {
                        // Silent error handling
                    }
                }

                subscribeAllRooms();

                const nextIntervalMs =
                    fetchedRooms.length === 0 ? EMPTY_ROOMS_SYNC_INTERVAL_MS : HAS_ROOMS_SYNC_INTERVAL_MS;
                if (syncIntervalMsRef.current !== nextIntervalMs) {
                    syncIntervalMsRef.current = nextIntervalMs;
                    if (syncIntervalRef.current) {
                        clearInterval(syncIntervalRef.current);
                    }
                    syncIntervalRef.current = setInterval(() => {
                        void syncRoomsAndSubscriptions();
                    }, syncIntervalMsRef.current);
                }
            } catch (error) {
                const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
                if (axiosError?.response?.status === 404) {
                    setRooms([]);
                    setRoomsLoadError(null);
                    setRoomsHydrated(true);
                    roomActivitySnapshotRef.current.clear();
                    subscribeAllRooms();

                    const nextIntervalMs = EMPTY_ROOMS_SYNC_INTERVAL_MS;
                    if (syncIntervalMsRef.current !== nextIntervalMs) {
                        syncIntervalMsRef.current = nextIntervalMs;
                        if (syncIntervalRef.current) {
                            clearInterval(syncIntervalRef.current);
                        }
                        syncIntervalRef.current = setInterval(() => {
                            void syncRoomsAndSubscriptions();
                        }, syncIntervalMsRef.current);
                    }
                    return;
                }

                const message =
                    axiosError?.response?.data?.message ||
                    (axiosError?.response?.status === 503
                        ? "Chat service is temporarily unavailable."
                        : "Could not load conversations. Please try again.");
                setRoomsLoadError(message);
                setRoomsHydrated(true);
            }
        };

        void syncRoomsAndSubscriptions();

        if (!syncIntervalRef.current) {
            syncIntervalRef.current = setInterval(() => {
                void syncRoomsAndSubscriptions();
            }, syncIntervalMsRef.current);
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
            syncIntervalMsRef.current = EMPTY_ROOMS_SYNC_INTERVAL_MS;
        };
    }, [user?.id, isAuthenticated, setRooms, setRoomsHydrated, setRoomsLoadError, subscribeAllRooms]);

    // Re-attach websocket handlers whenever socket connects or room list changes.
    useEffect(() => {
        if (!isConnected || !user?.id || rooms.length === 0) {
            return;
        }
        subscribeAllRooms();
    }, [isConnected, user?.id, rooms, subscribeAllRooms]);

    useEffect(() => {
        if (!isAuthenticated) {
            subscribedRoomsRef.current.clear();
            roomActivitySnapshotRef.current.clear();
            setRoomsHydrated(false);
            setRoomsLoadError(null);
            processedMessagesRef.current.clear();
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
            syncIntervalMsRef.current = EMPTY_ROOMS_SYNC_INTERVAL_MS;
        }
    }, [isAuthenticated, setRoomsHydrated, setRoomsLoadError]);

    return <ChatSocketContext.Provider value={chatSocket}>{children}</ChatSocketContext.Provider>;
}
