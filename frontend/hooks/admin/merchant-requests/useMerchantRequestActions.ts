import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { authApi } from "@/lib/api/authApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { useNotificationStore } from "@/stores/useNotificationStore";
import type { User } from "@/types";

export function useMerchantRequestActions(onSuccess: () => void) {
    const confirm = useConfirm();
    const markAsRead = useNotificationStore((s) => s.markAsRead);

    const handleApprove = async (request: User) => {
        const ok = await confirm({
            title: "Approve merchant",
            description: `Approve ${request.username} as a merchant?`,
            confirmText: "Approve",
            cancelText: "Cancel",
        });
        if (!ok) return;

        try {
            await authApi.approveMerchant(request.id);
            toast.success("Merchant approved successfully!");

            const phone = request.phone?.trim();
            if (phone) {
                try {
                    await restaurantApi.createRestaurant({
                        resName: request.username ? `${request.username}'s Restaurant` : "My Restaurant",
                        address: "Not updated",
                        longitude: 106.809883,
                        latitude: 10.841228,
                        openingTime: "09:00:00",
                        closingTime: "22:00:00",
                        phone,
                        merchantId: request.id,
                    });
                } catch {
                    // Silent
                }
            }

            const { notifications } = useNotificationStore.getState();
            notifications
                .filter((n) => n.type === "ADMIN_MERCHANT_REQUEST" && n.merchantId === request.id)
                .forEach((n) => markAsRead(n.id));

            onSuccess();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Unable to approve merchant";
            toast.error(errorMessage);
        }
    };

    const handleReject = async (request: User, reason: string) => {
        try {
            await authApi.rejectMerchant(request.id, { reason });
            toast.success("Merchant rejected successfully!");

            const { notifications } = useNotificationStore.getState();
            notifications
                .filter((n) => n.type === "ADMIN_MERCHANT_REQUEST" && n.merchantId === request.id)
                .forEach((n) => markAsRead(n.id));

            onSuccess();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Unable to reject merchant";
            toast.error(errorMessage);
        }
    };

    return { handleApprove, handleReject };
}
