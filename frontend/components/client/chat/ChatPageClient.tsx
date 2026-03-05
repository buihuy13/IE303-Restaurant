"use client";

import ChatClient from "@/components/client/Chat/ChatClient";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatRooms } from "@/hooks/client/chat/useChatRooms";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ChatPageClient() {
    const { user, isAuthenticated } = useAuthStore();
    const searchParams = useSearchParams();
    const initialRoomId = searchParams.get("roomId");
    const { rooms, isLoading } = useChatRooms(user?.id);

    if (!isAuthenticated || !user) {
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
            <ChatClient initialRooms={rooms} currentUserId={user.id} initialRoomId={initialRoomId} />
        </div>
    );
}

