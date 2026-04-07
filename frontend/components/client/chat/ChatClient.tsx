"use client";

import { useChatSocketContext } from "@/components/providers/ChatProvider";
import { authApi } from "@/lib/api/authApi";
import { chatApi } from "@/lib/api/chatApi";
import { useChatStore } from "@/stores/useChatStore";
import { ChatRoom, Message, MessageDTO } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

const normalizeId = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();
const isSameId = (left: string | null | undefined, right: string | null | undefined) =>
    normalizeId(left) === normalizeId(right);
const toTimestampMs = (value: unknown) => {
    if (value == null) return 0;
    if (value instanceof Date) {
        const ms = value.getTime();
        return Number.isFinite(ms) ? ms : 0;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }
    const raw = typeof value === "string" ? value.trim() : String(value).trim();
    if (!raw) return 0;
    const normalized = raw
        .replace(" ", "T")
        // Keep at most millisecond precision so Date parsing is stable in browsers.
        .replace(/\.(\d{3})\d+/, ".$1");
    const needsTimezone = !/[zZ]$/.test(normalized) && !/[+-]\d{2}:\d{2}$/.test(normalized);
    const withTimezone = needsTimezone ? `${normalized}Z` : normalized;
    const parsed = new Date(withTimezone).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};

interface ChatClientProps {
    initialRooms: ChatRoom[];
    currentUserId: string;
    initialRoomId?: string | null;
    initialPartnerId?: string | null;
}

export default function ChatClient({
    initialRooms,
    currentUserId,
    initialRoomId,
    initialPartnerId,
}: ChatClientProps) {
    const log = (...args: unknown[]) => {
        console.log("[chat-client]", ...args);
    };
    const rooms = useChatStore((state) => state.rooms);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerName, setPartnerName] = useState<string>("User");
    const [showChatWindow, setShowChatWindow] = useState(false); // For mobile: show chat window or list
    const normalizeMessageForCurrentRoom = useCallback(
        <T extends MessageDTO | Message>(message: T, currentPartnerId: string): T => {
            const normalizedCurrentUserId = normalizeId(currentUserId);
            const normalizedPartnerId = normalizeId(currentPartnerId);
            const normalizedSenderId = normalizeId(message.senderId);
            const normalizedReceiverId = normalizeId(message.receiverId);

            // If backend sends malformed receiver for own/partner messages, auto-correct to the room counterpart.
            if (normalizedSenderId === normalizedCurrentUserId && normalizedReceiverId === normalizedCurrentUserId) {
                return { ...message, senderId: currentUserId, receiverId: currentPartnerId } as T;
            }
            if (normalizedSenderId === normalizedPartnerId && normalizedReceiverId === normalizedPartnerId) {
                return { ...message, senderId: currentPartnerId, receiverId: currentUserId } as T;
            }
            return message;
        },
        [currentUserId],
    );

    // Initialize store with initialRooms if store is empty
    useEffect(() => {
        const storeRooms = useChatStore.getState().rooms;
        if (storeRooms.length === 0 && initialRooms.length > 0) {
            useChatStore.getState().setRooms(initialRooms);
        }
    }, [initialRooms]);

    // Cache partner info
    const partnerInfoCacheRef = useRef<Record<string, { name: string; fetched: boolean }>>({});
    const fetchingPartnerRef = useRef<Set<string>>(new Set());

    const getPartnerInfo = useCallback(async (partnerId: string) => {
        if (partnerInfoCacheRef.current[partnerId]?.fetched) {
            return partnerInfoCacheRef.current[partnerId];
        }

        if (fetchingPartnerRef.current.has(partnerId)) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (partnerInfoCacheRef.current[partnerId]?.fetched) {
                return partnerInfoCacheRef.current[partnerId];
            }
        }

        fetchingPartnerRef.current.add(partnerId);

        try {
            const user = await authApi.getUserById(partnerId);
            const info = { name: user?.username || `User ${partnerId.slice(0, 8)}`, fetched: true };
            partnerInfoCacheRef.current[partnerId] = info;
            return info;
        } catch {
            const info = { name: `User ${partnerId.slice(0, 8)}`, fetched: true };
            partnerInfoCacheRef.current[partnerId] = info;
            return info;
        } finally {
            fetchingPartnerRef.current.delete(partnerId);
        }
    }, []);

    const partnerInitializedRef = useRef(false);

    useEffect(() => {
        if (initialPartnerId && !partnerId && !partnerInitializedRef.current) {
            setPartnerId(initialPartnerId);
            partnerInitializedRef.current = true;
            getPartnerInfo(initialPartnerId).then((info) => setPartnerName(info.name));
        }
    }, [initialPartnerId, partnerId, getPartnerInfo]);

    const roomsReloadedRef = useRef(false);

    useEffect(() => {
        const reloadRoomsIfNeeded = async () => {
            if (initialRoomId && !roomsReloadedRef.current && !rooms.find((r) => r.id === initialRoomId)) {
                roomsReloadedRef.current = true;
                try {
                    const response = await chatApi.getAllRoomsByUserId(currentUserId);
                    const updatedRooms = response.data?.content || [];
                    useChatStore.getState().setRooms(updatedRooms);

                    if (!updatedRooms.find((r) => r.id === initialRoomId) && initialPartnerId) {
                        if (initialPartnerId !== partnerId) {
                            setPartnerId(initialPartnerId);
                            const info = await getPartnerInfo(initialPartnerId);
                            setPartnerName(info.name);
                        }
                    }
                } catch {
                    if (initialRoomId && !partnerId && initialPartnerId) {
                        setPartnerId(initialPartnerId);
                        getPartnerInfo(initialPartnerId).then((info) => setPartnerName(info.name));
                    }
                }
            }
        };

        reloadRoomsIfNeeded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialRoomId, currentUserId, initialPartnerId]);

    const { isConnected, sendMessage: sendMessageToSocket, connect: connectChatSocket } = useChatSocketContext();

    const selectedRoomIdRef = useRef<string | null>(selectedRoomId);
    const partnerIdRef = useRef<string | null>(partnerId);
    const isConnectedRef = useRef<boolean>(isConnected);
    useEffect(() => {
        selectedRoomIdRef.current = selectedRoomId;
    }, [selectedRoomId]);
    useEffect(() => {
        partnerIdRef.current = partnerId;
    }, [partnerId]);
    useEffect(() => {
        isConnectedRef.current = isConnected;
    }, [isConnected]);

    const processedMessagesRef = useRef<Set<string>>(new Set());
    const processedMessagesPerRoomRef = useRef<Map<string, Set<string>>>(new Map());

    const handleMessageReceived = useCallback(
        (message: MessageDTO) => {
            if (message.roomId !== selectedRoomIdRef.current) {
                return;
            }

            // Get current partnerId from state or ref
            const currentPartnerId = partnerIdRef.current;
            if (!currentPartnerId) {
                return;
            }

            const normalizedMessage = normalizeMessageForCurrentRoom(message, currentPartnerId);

            // Filter: Only process messages between currentUserId and partnerId
            const isFromCurrentUser = isSameId(normalizedMessage.senderId, currentUserId);
            const isToCurrentUser = isSameId(normalizedMessage.receiverId, currentUserId);
            const isFromPartner = isSameId(normalizedMessage.senderId, currentPartnerId);
            const isToPartner = isSameId(normalizedMessage.receiverId, currentPartnerId);

            // Only process if it's a message between current user and partner
            if (!((isFromCurrentUser && isToPartner) || (isFromPartner && isToCurrentUser))) {
                return;
            }

            const messageKey = `${normalizedMessage.roomId}-${normalizedMessage.content}-${normalizedMessage.senderId}-${normalizedMessage.receiverId}-${
                normalizedMessage.timestamp
                    ? Math.floor(toTimestampMs(normalizedMessage.timestamp) / 1000)
                    : Math.floor(Date.now() / 1000)
            }`;

            if (processedMessagesRef.current.has(messageKey)) {
                return;
            }

            processedMessagesRef.current.add(messageKey);

            if (processedMessagesRef.current.size > 200) {
                const keysArray = Array.from(processedMessagesRef.current);
                const recentKeys = keysArray.slice(-100);
                processedMessagesRef.current = new Set(recentKeys);
            }

            setMessages((prev) => {
                // Filter existing messages to only include messages between currentUserId and partnerId
                const filteredPrev = prev.filter((m) => {
                    const mIsFromCurrentUser = m.senderId === currentUserId;
                    const mIsToCurrentUser = m.receiverId === currentUserId;
                    const mIsFromPartner = m.senderId === currentPartnerId;
                    const mIsToPartner = m.receiverId === currentPartnerId;
                    return (mIsFromCurrentUser && mIsToPartner) || (mIsFromPartner && mIsToCurrentUser);
                });

                const messageTimestamp = normalizedMessage.timestamp || new Date().toISOString();
                const messageTime = toTimestampMs(messageTimestamp);

                const existingMessage = filteredPrev.find((m) => {
                    const mTime = toTimestampMs(m.timestamp);
                    const timeDiff = Math.abs(mTime - messageTime);
                    return (
                        isSameId(m.senderId, normalizedMessage.senderId) &&
                        isSameId(m.receiverId, normalizedMessage.receiverId) &&
                        m.content === normalizedMessage.content &&
                        timeDiff < 1000
                    );
                });

                if (existingMessage) {
                    return filteredPrev;
                }

                if (isSameId(normalizedMessage.senderId, currentUserId)) {
                    const optimisticIndex = filteredPrev.findIndex(
                        (m) =>
                            m.id.startsWith("temp-") &&
                            isSameId(m.senderId, normalizedMessage.senderId) &&
                            isSameId(m.receiverId, normalizedMessage.receiverId) &&
                            m.content === normalizedMessage.content,
                    );

                    if (optimisticIndex >= 0) {
                        const updated = [...filteredPrev];
                        updated[optimisticIndex] = {
                            ...updated[optimisticIndex],
                            timestamp: messageTimestamp,
                        };
                        return updated.sort((a, b) => toTimestampMs(a.timestamp) - toTimestampMs(b.timestamp));
                    }
                }

                const newMessage: Message = {
                    id: `temp-${Date.now()}`,
                    roomId: normalizedMessage.roomId,
                    senderId: normalizedMessage.senderId,
                    receiverId: normalizedMessage.receiverId,
                    content: normalizedMessage.content,
                    timestamp: messageTimestamp,
                    read: false,
                };

                const updated = [...filteredPrev, newMessage];
                return updated.sort((a, b) => toTimestampMs(a.timestamp) - toTimestampMs(b.timestamp));
            });
        },
        [currentUserId, normalizeMessageForCurrentRoom],
    );

    useEffect(() => {
        if (!selectedRoomId) {
            return;
        }

        const handleGlobalMessage = (event: CustomEvent<MessageDTO>) => {
            const message = event.detail;

            if (message.roomId !== selectedRoomIdRef.current) {
                return;
            }

            // Get current partnerId from ref
            const currentPartnerId = partnerIdRef.current;
            if (!currentPartnerId) {
                return;
            }

            // Filter: Only process messages between currentUserId and partnerId
            const normalizedMessage = normalizeMessageForCurrentRoom(message, currentPartnerId);
            const isFromCurrentUser = isSameId(normalizedMessage.senderId, currentUserId);
            const isToCurrentUser = isSameId(normalizedMessage.receiverId, currentUserId);
            const isFromPartner = isSameId(normalizedMessage.senderId, currentPartnerId);
            const isToPartner = isSameId(normalizedMessage.receiverId, currentPartnerId);

            if (!((isFromCurrentUser && isToPartner) || (isFromPartner && isToCurrentUser))) {
                return;
            }

            const messageKey = `${normalizedMessage.content}-${normalizedMessage.senderId}-${normalizedMessage.receiverId}-${
                normalizedMessage.timestamp
                    ? Math.floor(toTimestampMs(normalizedMessage.timestamp) / 1000)
                    : Math.floor(Date.now() / 1000)
            }`;

            if (!processedMessagesPerRoomRef.current.has(normalizedMessage.roomId)) {
                processedMessagesPerRoomRef.current.set(normalizedMessage.roomId, new Set());
            }
            const processedSet = processedMessagesPerRoomRef.current.get(normalizedMessage.roomId)!;

            if (processedSet.has(messageKey)) {
                return;
            }

            processedSet.add(messageKey);

            if (processedSet.size > 50) {
                const keysArray = Array.from(processedSet);
                const recentKeys = keysArray.slice(-25);
                processedMessagesPerRoomRef.current.set(normalizedMessage.roomId, new Set(recentKeys));
            }

            handleMessageReceived(normalizedMessage);

            if (
                normalizedMessage.roomId === selectedRoomIdRef.current &&
                isSameId(normalizedMessage.receiverId, currentUserId)
            ) {
                (async () => {
                    try {
                        await chatApi.markMessagesAsRead(normalizedMessage.roomId, currentUserId);
                        useChatStore.getState().resetUnreadCount(normalizedMessage.roomId);
                    } catch {
                        // Silent error handling
                    }
                })();
            }
        };

        window.addEventListener("chat-message-received", handleGlobalMessage as EventListener);

        return () => {
            window.removeEventListener("chat-message-received", handleGlobalMessage as EventListener);
        };
    }, [selectedRoomId, handleMessageReceived, currentUserId, normalizeMessageForCurrentRoom]);

    const lastLoadedRoomIdRef = useRef<string | null>(null);

    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedRoomId) {
                setMessages([]);
                lastLoadedRoomIdRef.current = null;
                processedMessagesRef.current.clear();
                return;
            }

            if (lastLoadedRoomIdRef.current === selectedRoomId) {
                return;
            }

            lastLoadedRoomIdRef.current = selectedRoomId;
            processedMessagesRef.current.clear();
            processedMessagesPerRoomRef.current.delete(selectedRoomId);
            setIsLoadingMessages(true);
            try {
                const response = await chatApi.getMessagesByRoomId(selectedRoomId, 0);
                const loadedMessages = response.data?.content || [];

                const mappedMessages: Message[] = loadedMessages.map((msg) => ({
                    id: msg.id,
                    roomId: msg.roomId || msg.room?.id || selectedRoomId,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    read: msg.read,
                }));

                // Get partnerId for filtering
                const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
                const currentPartner = selectedRoom
                    ? selectedRoom.user1Id === currentUserId
                        ? selectedRoom.user2Id
                        : selectedRoom.user1Id
                    : null;

                // Filter messages to only include messages between currentUserId and partnerId
                const filteredMessages = currentPartner
                    ? mappedMessages.map((msg) => normalizeMessageForCurrentRoom(msg, currentPartner)).filter((msg) => {
                          const isFromCurrentUser = isSameId(msg.senderId, currentUserId);
                          const isToCurrentUser = isSameId(msg.receiverId, currentUserId);
                          const isFromPartner = isSameId(msg.senderId, currentPartner);
                          const isToPartner = isSameId(msg.receiverId, currentPartner);
                          return (isFromCurrentUser && isToPartner) || (isFromPartner && isToCurrentUser);
                      })
                    : mappedMessages;

                // Remove duplicates
                const uniqueMessages = filteredMessages.reduce((acc, msg) => {
                    const existingIndex = acc.findIndex((m) => {
                        const sameId = m.id === msg.id;
                        const sameContent = m.content === msg.content;
                        const sameSender = m.senderId === msg.senderId;
                        const sameReceiver = m.receiverId === msg.receiverId;
                        const timeDiff = Math.abs(toTimestampMs(m.timestamp) - toTimestampMs(msg.timestamp));
                        const sameTime = timeDiff < 1000;
                        return sameId || (sameContent && sameSender && sameReceiver && sameTime);
                    });

                    if (existingIndex === -1) {
                        acc.push(msg);
                    }

                    return acc;
                }, [] as Message[]);

                const sortedMessages = [...uniqueMessages].sort(
                    (a, b) => toTimestampMs(a.timestamp) - toTimestampMs(b.timestamp),
                );

                sortedMessages.forEach((msg) => {
                    const messageKey = `${msg.roomId}-${msg.content}-${msg.senderId}-${msg.receiverId}-${Math.floor(
                        toTimestampMs(msg.timestamp) / 1000,
                    )}`;
                    processedMessagesRef.current.add(messageKey);
                });

                setMessages(sortedMessages);

                // Use selectedRoom and currentPartner already defined above
                if (selectedRoom && currentPartner) {
                    if (currentPartner !== partnerId) {
                        setPartnerId(currentPartner);
                    }

                    const cachedInfo = partnerInfoCacheRef.current[currentPartner];
                    if (cachedInfo?.fetched) {
                        setPartnerName(cachedInfo.name);
                    } else {
                        const info = await getPartnerInfo(currentPartner);
                        setPartnerName(info.name);
                    }
                } else if (initialPartnerId) {
                    setPartnerId(initialPartnerId);
                    const info = await getPartnerInfo(initialPartnerId);
                    setPartnerName(info.name);
                }

                try {
                    await chatApi.markMessagesAsRead(selectedRoomId, currentUserId);
                    useChatStore.getState().resetUnreadCount(selectedRoomId);
                } catch {
                    // Silent error handling
                }
            } catch {
                toast.error("Failed to load messages");
                lastLoadedRoomIdRef.current = null;
            } finally {
                setIsLoadingMessages(false);
            }
        };

        loadMessages();
        // Intentionally scoped to selected room + current user to avoid unnecessary reload loops.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoomId, currentUserId, normalizeMessageForCurrentRoom]);

    const lastUpdatedPartnerRef = useRef<string | null>(null);
    const lastSelectedRoomIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (selectedRoomId !== lastSelectedRoomIdRef.current) {
            lastSelectedRoomIdRef.current = selectedRoomId;
            lastUpdatedPartnerRef.current = null;
        }

        if (selectedRoomId) {
            const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
            if (selectedRoom) {
                const partner = selectedRoom.user1Id === currentUserId ? selectedRoom.user2Id : selectedRoom.user1Id;
                if (partner !== partnerId && partner !== lastUpdatedPartnerRef.current) {
                    lastUpdatedPartnerRef.current = partner;
                    setPartnerId(partner);

                    const cachedInfo = partnerInfoCacheRef.current[partner];
                    if (cachedInfo?.fetched) {
                        setPartnerName(cachedInfo.name);
                    } else {
                        getPartnerInfo(partner).then((info) => setPartnerName(info.name));
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoomId, currentUserId, getPartnerInfo]);

    const handleMarkAsRead = useCallback(async () => {
        if (!selectedRoomId) return;

        try {
            await chatApi.markMessagesAsRead(selectedRoomId, currentUserId);
            useChatStore.getState().resetUnreadCount(selectedRoomId);
        } catch {
            // Silent error handling
        }
    }, [selectedRoomId, currentUserId]);

    const handleSendMessage = useCallback(
        async (content: string, receiverId: string) => {
            if (!selectedRoomId) {
                toast.error("Please select a conversation first");
                return;
            }

            let actualRoomId = selectedRoomId;
            try {
                log("request roomId", { currentUserId, receiverId });
                const response = await chatApi.getRoomId(currentUserId, receiverId);
                actualRoomId = response.data.roomId;
                log("roomId resolved", { actualRoomId });

                if (actualRoomId !== selectedRoomId) {
                    setSelectedRoomId(actualRoomId);
                }
            } catch {
                toast.error("Failed to create chat room. Please try again.");
                return;
            }

            // Always try to reconnect once if socket is down, so sending does not get blocked
            // before room API calls complete.
            let isSocketReady = isConnectedRef.current;
            if (!isSocketReady) {
                try {
                    const connected = await connectChatSocket();
                    log("reconnect result", { connected });
                    isSocketReady = connected;
                } catch {
                    // Silent: we'll show a single user-facing error below.
                    log("reconnect threw exception");
                }
            }

            if (!isSocketReady) {
                toast.error("Chat is reconnecting. Please send again in a moment.");
                return;
            }

            const sent = sendMessageToSocket(actualRoomId, content, receiverId);
            log("send result", { sent, actualRoomId, receiverId });
            if (!sent) {
                toast.error("Failed to send message. Please try again.");
                return;
            }

            const optimisticMessage: Message = {
                id: `temp-${Date.now()}-${currentUserId}`,
                roomId: actualRoomId,
                senderId: currentUserId,
                receiverId,
                content,
                timestamp: new Date().toISOString(),
                read: false,
            };
            setMessages((prev) => {
                const exists = prev.some(
                    (m) =>
                        m.content === optimisticMessage.content &&
                            isSameId(m.senderId, optimisticMessage.senderId) &&
                            isSameId(m.receiverId, optimisticMessage.receiverId) &&
                        m.id.startsWith("temp-") &&
                        Math.abs(toTimestampMs(m.timestamp) - toTimestampMs(optimisticMessage.timestamp)) <
                            1000,
                );
                if (exists) {
                    return prev;
                }
                const updated = [...prev, optimisticMessage];
                return updated.sort((a, b) => toTimestampMs(a.timestamp) - toTimestampMs(b.timestamp));
            });

            useChatStore.getState().updateRoomLastMessage(actualRoomId, content, new Date().toISOString());

            // Keep optimistic message and let websocket/history sync reconcile naturally.
        },
        [selectedRoomId, sendMessageToSocket, currentUserId, connectChatSocket],
    );

    const handleSelectRoom = useCallback((roomId: string) => {
        setSelectedRoomId(roomId);
        // On mobile, show chat window when room is selected
        if (window.innerWidth < 1024) {
            setShowChatWindow(true);
        }
    }, []);

    const handleBack = useCallback(() => {
        setShowChatWindow(false);
    }, []);

    if (!currentUserId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Please log in to use chat</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-200px)] max-h-[800px] overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
            {/* Desktop Layout: 2 Columns */}
            <div className="hidden lg:flex h-full">
                {/* Sidebar - 30% */}
                <div className="w-[30%] flex-shrink-0 border-r border-gray-200">
                    <ChatList
                        rooms={rooms}
                        currentUserId={currentUserId}
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={handleSelectRoom}
                        onGetPartnerInfo={getPartnerInfo}
                    />
                </div>

                {/* Chat Window - 70% */}
                <div className="flex-1">
                    {selectedRoomId && partnerId ? (
                        <ChatWindow
                            messages={messages}
                            currentUserId={currentUserId}
                            partnerId={partnerId}
                            partnerName={partnerName}
                            onSendMessage={handleSendMessage}
                            isConnected={isConnected}
                            isLoading={isLoadingMessages}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gray-50">
                            <div className="text-center">
                                {/* Empty State Illustration */}
                                <div className="mb-6">
                                    <svg
                                        width="200"
                                        height="200"
                                        viewBox="0 0 200 200"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mx-auto text-gray-300"
                                    >
                                        <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
                                        <path
                                            d="M60 80C60 75.5817 63.5817 72 68 72H132C136.418 72 140 75.5817 140 80V120C140 124.418 136.418 128 132 128H68C63.5817 128 60 124.418 60 120V80Z"
                                            fill="currentColor"
                                            opacity="0.2"
                                        />
                                        <circle cx="80" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                        <circle cx="100" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                        <circle cx="120" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                        <path
                                            d="M70 130C70 128.343 71.3431 127 73 127H127C128.657 127 130 128.343 130 130C130 131.657 128.657 133 127 133H73C71.3431 133 70 131.657 70 130Z"
                                            fill="currentColor"
                                            opacity="0.3"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-800">Select a conversation</h3>
                                <p className="text-sm text-gray-500">Choose a chat from the list to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Layout: Toggle between List and Chat */}
            <div className="h-full lg:hidden">
                {!showChatWindow ? (
                    <ChatList
                        rooms={rooms}
                        currentUserId={currentUserId}
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={handleSelectRoom}
                        onGetPartnerInfo={getPartnerInfo}
                    />
                ) : selectedRoomId && partnerId ? (
                    <ChatWindow
                        messages={messages}
                        currentUserId={currentUserId}
                        partnerId={partnerId}
                        partnerName={partnerName}
                        onSendMessage={handleSendMessage}
                        isConnected={isConnected}
                        isLoading={isLoadingMessages}
                        onMarkAsRead={handleMarkAsRead}
                        onBack={handleBack}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="mb-6">
                                <svg
                                    width="200"
                                    height="200"
                                    viewBox="0 0 200 200"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mx-auto text-gray-300"
                                >
                                    <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
                                    <path
                                        d="M60 80C60 75.5817 63.5817 72 68 72H132C136.418 72 140 75.5817 140 80V120C140 124.418 136.418 128 132 128H68C63.5817 128 60 124.418 60 120V80Z"
                                        fill="currentColor"
                                        opacity="0.2"
                                    />
                                    <circle cx="80" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                    <circle cx="100" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                    <circle cx="120" cy="100" r="6" fill="currentColor" opacity="0.3" />
                                    <path
                                        d="M70 130C70 128.343 71.3431 127 73 127H127C128.657 127 130 128.343 130 130C130 131.657 128.657 133 127 133H73C71.3431 133 70 131.657 70 130Z"
                                        fill="currentColor"
                                        opacity="0.3"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a conversation</h3>
                            <p className="text-sm text-gray-500">Choose a chat from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
