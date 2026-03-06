"use client";

import ChatClient from "@/components/client/chat/ChatClient";
import { useChatRooms } from "@/hooks/client/chat/useChatRooms";
import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AdminMessagesHeader } from "./AdminMessagesHeader";

export function AdminMessagesPageClient() {
    const { user, isAuthenticated } = useAuthStore();
    const { rooms, isLoading } = useChatRooms(user?.id);
    const searchParams = useSearchParams();
    const initialRoomId = searchParams.get("roomId");

    return (
        <div className="space-y-6">
            <AdminMessagesHeader />

            {!isAuthenticated || !user ? (
                <div className="flex items-center justify-center h-[600px] rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Please log in to use chat</p>
                </div>
            ) : isLoading ? (
                <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
                </div>
            ) : (
                <ChatClient
                    initialRooms={rooms}
                    currentUserId={user.id}
                    initialRoomId={initialRoomId}
                />
            )}
        </div>
    );
}
