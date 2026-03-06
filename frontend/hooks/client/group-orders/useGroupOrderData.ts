import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { groupOrderApi } from "@/lib/api/groupOrderApi";
import { GroupOrderStatus, type GroupOrder } from "@/types/groupOrder.type";

const POLL_INTERVAL_MS = 10000;

export function useGroupOrderData(shareToken: string | undefined) {
    const router = useRouter();
    const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchGroupOrder = useCallback(async () => {
        if (!shareToken) return;
        setLoading(true);
        try {
            const data = await groupOrderApi.getGroupOrderByToken(shareToken);
            setGroupOrder(data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
            console.error("Failed to fetch group order:", err);
            toast.error(err.response?.data?.message || err.message || "Unable to load the group order.");
            if (err.response?.status === 404) router.push("/");
        } finally {
            setLoading(false);
        }
    }, [shareToken, router]);

    useEffect(() => {
        if (shareToken) fetchGroupOrder();
    }, [shareToken, fetchGroupOrder]);

    useEffect(() => {
        const status = groupOrder?.status;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (
            status &&
            status !== GroupOrderStatus.ORDERED &&
            status !== GroupOrderStatus.CANCELLED
        ) {
            intervalRef.current = setInterval(fetchGroupOrder, POLL_INTERVAL_MS);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [groupOrder?.status, fetchGroupOrder]);

    return { groupOrder, setGroupOrder, loading, fetchGroupOrder };
}
