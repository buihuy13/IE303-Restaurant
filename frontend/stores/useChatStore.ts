"use client";

import { ChatRoom, MessageDTO } from "@/types";
import { create } from "zustand";

interface ChatState {
        rooms: ChatRoom[];
        roomsHydrated: boolean;
        roomsLoadError: string | null;
        unreadCountMap: Record<string, number>; // roomId -> unread count
        lastMessageMap: Record<string, MessageDTO>; // roomId -> last message
        activeViewingRoomId: string | null;
        setActiveViewingRoomId: (roomId: string | null) => void;
        setRooms: (rooms: ChatRoom[]) => void;
        setRoomsHydrated: (hydrated: boolean) => void;
        setRoomsLoadError: (error: string | null) => void;
        addRoomIfNotExists: (room: ChatRoom) => void;
        updateUnreadCount: (roomId: string, count: number) => void;
        incrementUnreadCount: (roomId: string) => void;
        resetUnreadCount: (roomId: string) => void;
        setLastMessage: (roomId: string, message: MessageDTO) => void;
        updateRoomLastMessage: (roomId: string, message: string, timestamp: string) => void;
        getTotalUnreadCount: () => number;
        getUnreadCountByRoom: (roomId: string) => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
        rooms: [],
        roomsHydrated: false,
        roomsLoadError: null,
        unreadCountMap: {},
        lastMessageMap: {},
        activeViewingRoomId: null,

        setActiveViewingRoomId: (roomId) => set({ activeViewingRoomId: roomId }),

        setRooms: (rooms) => {
                set({ rooms });
        },

        setRoomsHydrated: (hydrated) => set({ roomsHydrated: hydrated }),

        setRoomsLoadError: (error) => set({ roomsLoadError: error }),
        
        addRoomIfNotExists: (newRoom: ChatRoom) => {
                set((state) => {
                        // Check if room already exists
                        const exists = state.rooms.some((room) => room.id === newRoom.id);
                        if (exists) {
                                return state; // Room already exists, no change needed
                        }
                        // Add new room to the beginning of the list (most recent)
                        return {
                                rooms: [newRoom, ...state.rooms],
                        };
                });
        },

        updateUnreadCount: (roomId, count) => {
                set((state) => ({
                        unreadCountMap: {
                                ...state.unreadCountMap,
                                [roomId]: count,
                        },
                }));
        },

        incrementUnreadCount: (roomId) => {
                set((state) => ({
                        unreadCountMap: {
                                ...state.unreadCountMap,
                                [roomId]: (state.unreadCountMap[roomId] || 0) + 1,
                        },
                }));
        },

        resetUnreadCount: (roomId) => {
                set((state) => {
                        const newMap = { ...state.unreadCountMap };
                        delete newMap[roomId];
                        return { unreadCountMap: newMap };
                });
        },

        setLastMessage: (roomId, message) => {
                set((state) => ({
                        lastMessageMap: {
                                ...state.lastMessageMap,
                                [roomId]: message,
                        },
                }));
        },

        updateRoomLastMessage: (roomId, message, timestamp) => {
                set((state) => {
                        // Update room's last message
                        const updatedRooms = state.rooms.map((room) =>
                                room.id === roomId
                                        ? {
                                                  ...room,
                                                  lastMessage: message,
                                                  lastMessageTime: timestamp,
                                          }
                                        : room
                        );
                        
                        // Sort rooms by lastMessageTime (newest first) to ensure room with latest message appears at top
                        const sortedRooms = [...updatedRooms].sort((a, b) => {
                                if (!a.lastMessageTime && !b.lastMessageTime) return 0;
                                if (!a.lastMessageTime) return 1;
                                if (!b.lastMessageTime) return -1;
                                return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
                        });
                        
                        return { rooms: sortedRooms };
                });
        },

        getTotalUnreadCount: () => {
                const { unreadCountMap } = get();
                return Object.values(unreadCountMap).reduce((sum, count) => sum + count, 0);
        },

        getUnreadCountByRoom: (roomId) => {
                const { unreadCountMap } = get();
                return unreadCountMap[roomId] || 0;
        },
}));

