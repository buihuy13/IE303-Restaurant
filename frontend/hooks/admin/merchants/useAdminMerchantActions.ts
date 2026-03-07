import toast from "react-hot-toast";
import { merchantApi } from "@/lib/api/merchantApi";

export function useAdminMerchantActions(onSuccess: () => void) {
    const handleApproveMerchant = async (merchantId: string) => {
        try {
            await merchantApi.approveMerchant(merchantId);
            toast.success("Merchant approved.");
            onSuccess();
        } catch (error) {
            console.error("Failed to approve merchant:", error);
            toast.error("Failed to approve merchant.");
        }
    };

    const handleRejectMerchant = async (merchantId: string, reason: string) => {
        try {
            await merchantApi.rejectMerchant(merchantId, reason);
            toast.success("Merchant rejected.");
            onSuccess();
        } catch (error) {
            console.error("Failed to reject merchant:", error);
            toast.error("Failed to reject merchant.");
        }
    };

    return { handleApproveMerchant, handleRejectMerchant };
}
