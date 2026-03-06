import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/authApi";
import type { User } from "@/types";

export function useMerchantRequestsData() {
    const [requests, setRequests] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMerchantRequests = useCallback(async () => {
        setLoading(true);
        try {
            const response = await authApi.getMerchantsPendingConsideration({
                page: 0,
                size: 200,
                sort: "createdAt,desc",
            });
            setRequests(response?.content || []);
        } catch (error) {
            console.error("Failed to fetch merchant requests:", error);
            toast.error("Unable to load merchant requests list");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMerchantRequests().catch(() => {});
    }, [fetchMerchantRequests]);

    return { requests, loading, fetchMerchantRequests };
}
