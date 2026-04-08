"use client";

import { startChat } from "@/lib/utils/chatUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Loader2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ChatWithRestaurantButtonProps {
    merchantId: string;
    restaurantName: string;
    variant?: "default" | "outline" | "ghost";
    className?: string;
}

export default function ChatWithRestaurantButton({
    merchantId,
    restaurantName,
    variant = "default",
    className = "",
}: ChatWithRestaurantButtonProps) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Fix hydration mismatch by only setting disabled state after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleChatClick = async () => {
        if (!isAuthenticated || !user?.id) {
            toast.error("Please login to chat with restaurant");
            router.push("/login");
            return;
        }

        // Prevent chatting with yourself
        if (user.id === merchantId) {
            toast.error("You cannot chat with yourself");
            return;
        }

        setIsLoading(true);
        try {
            // Validate merchantId
            if (!merchantId || merchantId.trim() === "") {
                toast.error("Restaurant information not found");
                setIsLoading(false);
                return;
            }

            const roomId = await startChat(user.id, merchantId);
            // Navigate to chat page with the roomId
            router.push(`/chat?roomId=${roomId}&partnerId=${merchantId}`);
        } catch (error) {
            console.error("Error starting chat:", error);
            // Show more specific error message
            const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage =
                axiosError?.response?.data?.message ||
                axiosError?.message ||
                "Unable to create chat room. Please try again later.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const uiVariant = variant === "outline" ? "brandOutline" : variant === "ghost" ? "brandGhost" : "brand";

    // Ensure disabled is always a boolean to avoid hydration mismatch
    const isDisabled = isMounted ? isLoading || !isAuthenticated : false;

    return (
        <Button
            onClick={handleChatClick}
            disabled={isDisabled}
            variant={uiVariant}
            className={className}
            aria-label={`Chat with ${restaurantName}`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating chat room...</span>
                </>
            ) : (
                <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat with Restaurant</span>
                </>
            )}
        </Button>
    );
}
