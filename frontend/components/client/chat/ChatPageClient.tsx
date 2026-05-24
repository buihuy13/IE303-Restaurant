"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSearchParams } from "next/navigation";
import { ChatPageView } from "@/components/client/chat/ChatPageView";

export default function ChatPageClient() {
    const { user, isAuthenticated } = useAuthStore();
    const searchParams = useSearchParams();
    const initialRoomId = searchParams.get("roomId");
    const initialPartnerId = searchParams.get("partnerId");
    const rooms = useChatStore((state) => state.rooms);
    const roomsHydrated = useChatStore((state) => state.roomsHydrated);
    const roomsLoadError = useChatStore((state) => state.roomsLoadError);
    const isLoading = !roomsHydrated;

    return (
        <ChatPageView
            isAuthenticated={!!isAuthenticated}
            userId={user?.id ?? null}
            rooms={rooms}
            isLoading={isLoading}
            loadError={roomsLoadError}
            initialRoomId={initialRoomId}
            initialPartnerId={initialPartnerId}
        />
    );
}
