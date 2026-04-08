"use client";

import ChatClient from "@/components/client/chat/ChatClient";
import type { ChatRoom } from "@/types";
import { Loader2 } from "lucide-react";

export interface ChatPageViewProps {
    isAuthenticated: boolean;
    userId: string | null;
    rooms: ChatRoom[];
    isLoading: boolean;
    initialRoomId: string | null;
    initialPartnerId: string | null;
}

export function ChatPageView({
    isAuthenticated,
    userId,
    rooms,
    isLoading,
    initialRoomId,
    initialPartnerId,
}: ChatPageViewProps) {
    if (!isAuthenticated || !userId) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white">
                <div className="custom-container py-8">
                    <div className="rounded-3xl border border-gray-200/90 bg-white p-8 text-center shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <div className="text-5xl mb-3">💬</div>
                        <p className="text-gray-900 font-semibold">Please log in to use chat</p>
                        <p className="text-sm text-gray-600 mt-1">Sign in to view your conversations with restaurants.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white">
                <div className="custom-container py-8 flex items-center justify-center h-[600px]">
                    <div className="flex items-center gap-3 rounded-3xl border border-gray-200/90 bg-white p-8 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />
                        <span className="text-sm font-semibold text-gray-800">Loading conversations...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white">
            <div className="custom-container py-8">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Chat</h1>
                    <p className="text-sm text-gray-600 mt-1">Message restaurants and track your conversations.</p>
                </div>
                <div className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                    <ChatClient
                        initialRooms={rooms}
                        currentUserId={userId}
                        initialRoomId={initialRoomId}
                        initialPartnerId={initialPartnerId}
                    />
                </div>
            </div>
        </div>
    );
}

