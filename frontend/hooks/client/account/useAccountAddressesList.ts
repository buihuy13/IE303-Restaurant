import { useAddressStore } from "@/stores/addressStore";
import type { Address } from "@/types";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";

export function useAccountAddressesList(params: { userId: string | null; enabled: boolean }) {
    const { userId, enabled } = params;
    const addresses = useAddressStore((state) => state.addresses);
    const loading = useAddressStore((state) => state.loading);
    const hydrated = useAddressStore((state) => state.hydrated);
    const fetchAddresses = useAddressStore((state) => state.fetchAddresses);

    const refresh = useCallback(async () => {
        if (!userId) return;

        try {
            await fetchAddresses(userId, { force: true });
        } catch (error) {
            console.error("Error fetching addresses:", error);
            let errorMessage = "Failed to load addresses";
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
    }, [userId, fetchAddresses]);

    useEffect(() => {
        if (!enabled || !userId) return;
        if (!hydrated) {
            void fetchAddresses(userId);
        }
    }, [enabled, userId, hydrated, fetchAddresses]);

    return {
        addresses: addresses as Address[],
        loading: loading || (enabled && !hydrated),
        refresh,
    };
}
