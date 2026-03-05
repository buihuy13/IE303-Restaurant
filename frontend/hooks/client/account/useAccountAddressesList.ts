import { authApi } from "@/lib/api/authApi";
import type { Address } from "@/types";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useAccountAddressesList(params: { userId: string | null; enabled: boolean }) {
    const { userId, enabled } = params;
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const data = await authApi.getUserAddresses(userId);
            setAddresses(Array.isArray(data) ? data : []);
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
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (!enabled) return;
        refresh();
    }, [enabled, refresh]);

    return { addresses, loading, refresh };
}

