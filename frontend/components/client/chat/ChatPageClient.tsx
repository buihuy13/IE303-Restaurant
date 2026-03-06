"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useChatRooms } from "@/hooks/client/chat/useChatRooms";
import { useSearchParams } from "next/navigation";
import { ChatPageView } from "@/components/client/chat/ChatPageView";

export default function ChatPageClient() {
    const { user, isAuthenticated } = useAuthStore();
    const searchParams = useSearchParams();
    const initialRoomId = searchParams.get("roomId");
    const { rooms, isLoading } = useChatRooms(user?.id);

    return (
        <ChatPageView
            isAuthenticated={!!isAuthenticated}
            userId={user?.id ?? null}
            rooms={rooms}
            isLoading={isLoading}
            initialRoomId={initialRoomId}
        />
    );
}