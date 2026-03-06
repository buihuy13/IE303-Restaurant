import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { groupOrderApi } from "@/lib/api/groupOrderApi";
import { orderApi } from "@/lib/api/orderApi";
import type { GroupOrder } from "@/types/groupOrder.type";

export function useGroupOrderActions(
    shareToken: string,
    groupOrder: GroupOrder | null,
    setGroupOrder: (g: GroupOrder | null) => void,
    fetchGroupOrder: () => Promise<void>,
    isAuthenticated: boolean,
    userId: string | undefined,
) {
    const router = useRouter();
    const confirmAction = useConfirm();
    const [isProcessing, setIsProcessing] = useState(false);

    const requireAuth = () => {
        if (!isAuthenticated || !userId) {
            router.push(`/login?redirect=${encodeURIComponent(`/group-orders/${shareToken}`)}`);
            return false;
        }
        return true;
    };

    const handleCopyLink = () => {
        if (typeof window === "undefined") return;
        const link = `${window.location.origin}/group-orders/${shareToken}`;
        navigator.clipboard.writeText(link);
        toast.success("Link copied.");
    };

    const handleLock = async () => {
        if (!requireAuth()) return;
        setIsProcessing(true);
        try {
            const data = await groupOrderApi.lockGroupOrder(shareToken);
            setGroupOrder(data);
            toast.success("Group order locked.");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Unable to lock the group order.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!requireAuth()) return;
        setIsProcessing(true);
        try {
            const result = await groupOrderApi.confirmGroupOrder(shareToken);
            setGroupOrder(result.groupOrder);
            toast.success("Group order confirmed.");
            const orderId = result.order?.orderId;
            if (orderId) {
                try {
                    const order = await orderApi.getOrderById(orderId);
                    const slug = order.slug || orderId;
                    router.push(`/delivery/${slug}?t=${Date.now()}`);
                } catch {
                    router.push(`/delivery/${orderId}?t=${Date.now()}`);
                }
            } else {
                toast.error("Order ID not found.");
                router.push("/account/orders");
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Unable to confirm the group order.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!requireAuth()) return;
        const ok = await confirmAction({
            title: "Cancel group order?",
            description: "This will cancel the group order and cannot be undone.",
            confirmText: "Cancel group order",
            cancelText: "Keep",
            variant: "danger",
        });
        if (!ok) return;
        setIsProcessing(true);
        try {
            await groupOrderApi.cancelGroupOrder(shareToken);
            toast.success("Group order canceled.");
            router.push("/");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Unable to cancel the group order.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveParticipant = async (participantUserId: string, userName: string) => {
        if (!requireAuth() || !groupOrder) return;
        if (participantUserId !== userId && userId !== groupOrder.creatorId) {
            toast.error("You don't have permission to remove this participant.");
            return;
        }
        const targetLabel = participantUserId === userId ? "yourself" : userName;
        const ok = await confirmAction({
            title: "Remove participant?",
            description: `Are you sure you want to remove ${targetLabel} from this group order?`,
            confirmText: "Remove",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) return;
        setIsProcessing(true);
        try {
            const data = await groupOrderApi.removeParticipant(shareToken, participantUserId);
            setGroupOrder(data);
            toast.success(participantUserId === userId ? "You left the group order." : "Participant removed.");
            if (participantUserId === userId) setTimeout(() => fetchGroupOrder(), 500);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(err.response?.data?.message || err.message || "Unable to remove the participant.");
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        isProcessing,
        handleCopyLink,
        handleLock,
        handleConfirm,
        handleCancel,
        handleRemoveParticipant,
    };
}
