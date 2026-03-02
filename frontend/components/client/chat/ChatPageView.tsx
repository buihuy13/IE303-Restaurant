"use client";

import ChatClient from "@/components/client/Chat/ChatClient";
import { Loader2 } from "lucide-react";
import type { ChatRoom } from "@/types";

export interface ChatPageViewProps {
    isAuthenticated: boolean;
    userId: string | null;
    rooms: ChatRoom[];
    isLoading: boolean;
    initialRoomId: string | null;
}

export function ChatPageView({ isAuthenticated, userId, rooms, isLoading, initialRoomId }: ChatPageViewProps) {
    if (!isAuthenticated || !userId) {
        return (
            <div className="custom-container py-6">
                <div className="flex items-center justify-center h-[600px]">
                    <p className="text-gray-500">Please log in to use chat</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="custom-container py-6">
                <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#EE4D2D]" />
                </div>
            </div>
        );
    }

    return (
        <div className="custom-container py-6">
            <ChatClient initialRooms={rooms} currentUserId={userId} initialRoomId={initialRoomId} />
        </div>
    );
}

