"use client";

import { authApi } from "@/lib/api/authApi";
import { useChatStore } from "@/stores/useChatStore";
import { ChatRoom, MessageDTO } from "@/types";
import toast from "react-hot-toast";

export const normalizeChatId = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

export const getRoomPartnerId = (room: ChatRoom, currentUserId: string): string | null => {
    const current = normalizeChatId(currentUserId);
    if (normalizeChatId(room.user1Id) === current) {
        return room.user2Id;
    }
    if (normalizeChatId(room.user2Id) === current) {
        return room.user1Id;
    }
    return null;
};

/** Align websocket payloads with the same rules used in ChatClient. */
export const normalizeMessageParticipants = (
    message: MessageDTO,
    currentUserId: string,
    partnerId: string | null,
): MessageDTO => {
    if (!partnerId) {
        return message;
    }

    const current = normalizeChatId(currentUserId);
    const partner = normalizeChatId(partnerId);
    const sender = normalizeChatId(message.senderId);
    const receiver = normalizeChatId(message.receiverId);

    if (sender === current && receiver === current) {
        return { ...message, senderId: currentUserId, receiverId: partnerId };
    }
    if (sender === partner && receiver === partner) {
        return { ...message, senderId: partnerId, receiverId: currentUserId };
    }

    return message;
};

export const isIncomingChatMessage = (
    message: MessageDTO,
    currentUserId: string,
    rooms: ChatRoom[],
): boolean => {
    const room = rooms.find((item) => normalizeChatId(item.id) === normalizeChatId(message.roomId));
    const partnerId = room ? getRoomPartnerId(room, currentUserId) : null;
    const normalized = normalizeMessageParticipants(message, currentUserId, partnerId);

    const current = normalizeChatId(currentUserId);
    const sender = normalizeChatId(normalized.senderId);
    const receiver = normalizeChatId(normalized.receiverId);

    if (receiver === current && sender !== current) {
        return true;
    }

    // Fallback when room metadata is missing but payload still targets the current user.
    if (!room) {
        const rawReceiver = normalizeChatId(message.receiverId);
        const rawSender = normalizeChatId(message.senderId);
        return rawReceiver === current && rawSender !== current;
    }

    return false;
};

const toDedupTimestampBucket = (value: unknown) => {
    if (value == null) {
        return "live";
    }
    const parsed = new Date(typeof value === "string" ? value : String(value)).getTime();
    if (!Number.isFinite(parsed)) {
        return "live";
    }
    return String(Math.floor(parsed / 1000));
};

const buildNormalizedMessage = (
    message: MessageDTO,
    currentUserId?: string,
    rooms?: ChatRoom[],
) => {
    const room = rooms?.find((item) => normalizeChatId(item.id) === normalizeChatId(message.roomId));
    const partnerId = room && currentUserId ? getRoomPartnerId(room, currentUserId) : null;
    return currentUserId != null
        ? normalizeMessageParticipants(message, currentUserId, partnerId)
        : message;
};

/**
 * Dedup for toast/badge/pipeline — room + sender + content only.
 * WS often has no timestamp while REST polling does, which caused duplicate toasts.
 */
export const getChatAlertDedupKey = (
    message: MessageDTO,
    currentUserId: string,
    rooms: ChatRoom[],
) => {
    const normalized = buildNormalizedMessage(message, currentUserId, rooms);
    return [
        normalizeChatId(normalized.roomId),
        normalizeChatId(normalized.senderId),
        normalized.content.trim(),
    ].join("|");
};

/** Stable dedup key with time bucket (for chat UI message list dedup). */
export const getChatMessageDedupKey = (
    message: MessageDTO,
    currentUserId?: string,
    rooms?: ChatRoom[],
) => {
    const normalized = buildNormalizedMessage(message, currentUserId, rooms);
    return [
        normalizeChatId(normalized.roomId),
        normalizeChatId(normalized.senderId),
        normalized.content.trim(),
        toDedupTimestampBucket(normalized.timestamp),
    ].join("|");
};

const senderDisplayNameCache = new Map<string, string>();
const senderDisplayNamePending = new Map<string, Promise<string>>();

const formatUserDisplayName = (username?: string | null) => {
    const trimmed = username?.trim();
    if (trimmed) {
        return trimmed;
    }
    return "User";
};

export const resolveSenderDisplayName = async (senderId: string): Promise<string> => {
    const trimmedId = senderId.trim();
    if (!trimmedId) {
        return "User";
    }

    const cached = senderDisplayNameCache.get(trimmedId);
    if (cached) {
        return cached;
    }

    const pending = senderDisplayNamePending.get(trimmedId);
    if (pending) {
        return pending;
    }

    const request = authApi
        .getUserById(trimmedId)
        .then((user) => {
            const name = formatUserDisplayName(user?.username);
            senderDisplayNameCache.set(trimmedId, name);
            return name;
        })
        .catch(() => {
            const fallback = "User";
            senderDisplayNameCache.set(trimmedId, fallback);
            return fallback;
        })
        .finally(() => {
            senderDisplayNamePending.delete(trimmedId);
        });

    senderDisplayNamePending.set(trimmedId, request);
    return request;
};

const processedIncomingKeys = new Set<string>();

const rememberProcessedKey = (key: string) => {
    processedIncomingKeys.add(key);
    if (processedIncomingKeys.size > 200) {
        const recent = Array.from(processedIncomingKeys).slice(-100);
        processedIncomingKeys.clear();
        recent.forEach((item) => processedIncomingKeys.add(item));
    }
};

/** Only true when user is on a chat screen AND actively viewing this room. */
const isViewingChatRoom = (roomId: string) => {
    if (typeof window === "undefined") {
        return false;
    }
    const { pathname, search } = window.location;
    const onChatScreen = pathname === "/chat" || pathname.startsWith("/merchant/messages");
    if (!onChatScreen) {
        return false;
    }

    const activeViewingRoomId = useChatStore.getState().activeViewingRoomId;
    if (activeViewingRoomId && normalizeChatId(activeViewingRoomId) === normalizeChatId(roomId)) {
        return true;
    }

    const activeRoomId = new URLSearchParams(search).get("roomId");
    return activeRoomId != null && normalizeChatId(activeRoomId) === normalizeChatId(roomId);
};

/**
 * Toast always; badge increment only when not viewing that room on chat screen.
 * Returns true when unread count on the Messages icon should increment.
 */
export const processIncomingChatAlert = async (
    message: MessageDTO,
    currentUserId: string,
    rooms: ChatRoom[],
    dedupKey?: string,
): Promise<boolean> => {
    if (!isIncomingChatMessage(message, currentUserId, rooms)) {
        return false;
    }

    const key = dedupKey ?? getChatAlertDedupKey(message, currentUserId, rooms);
    if (processedIncomingKeys.has(key)) {
        return false;
    }
    rememberProcessedKey(key);

    const normalized = buildNormalizedMessage(message, currentUserId, rooms);
    const senderLabel = await resolveSenderDisplayName(normalized.senderId);
    const toastId = `chat-toast-${key}`;

    toast.success(`New message from ${senderLabel}`, {
        id: toastId,
        duration: 4000,
        icon: "💬",
    });

    return !isViewingChatRoom(normalized.roomId);
};
