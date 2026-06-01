import { authApi } from "@/lib/api/authApi";
import { useCallback } from "react";
import toast from "react-hot-toast";

type ConfirmFn = (args: {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "default";
}) => Promise<boolean>;

export function useAccountAddressDelete(params: { confirm: ConfirmFn; onDeleted: () => void }) {
    const { confirm, onDeleted } = params;

    const deleteAddress = useCallback(
        async (addressId: string) => {
            const ok = await confirm({
                title: "Delete address?",
                description: "This address will be removed from your account.",
                confirmText: "Delete",
                cancelText: "Cancel",
                variant: "danger",
            });
            if (!ok) return;

            try {
                await authApi.deleteAddress(addressId);
                toast.success("Address deleted successfully!");
                onDeleted();
            } catch (error) {
                let errorMessage = "Failed to delete address";
                if (error && typeof error === "object" && "response" in error) {
                    const axiosError = error as {
                        response?: { data?: { message?: string } };
                        message?: string;
                    };
                    errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
                toast.error(errorMessage);
            }
        },
        [confirm, onDeleted],
    );

    return { deleteAddress };
}

