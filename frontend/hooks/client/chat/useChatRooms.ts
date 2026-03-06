import { useEffect, useState } from "react";
import { chatApi } from "@/lib/api/chatApi";
import type { ChatRoom } from "@/types";

export function useChatRooms(userId: string | null | undefined) {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRooms = async () => {
            if (!userId || userId === "testuserid" || userId.trim() === "") {
                setIsLoading(false);
                setRooms([]);
                return;
            }

            try {
                const response = await chatApi.getAllRoomsByUserId(userId);
                setRooms(response.data?.content || []);
            } catch (error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError?.response?.status === 404) {
                    setRooms([]);
                } else {
                    console.error("Error loading chat rooms:", error);
                    setRooms([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadRooms();
    }, [userId]);

    return { rooms, isLoading };
}

