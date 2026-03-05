import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { sizeApi } from "@/lib/api/sizeApi";
import type { Size } from "@/types";

export function useAdminSizesData() {
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSizes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await sizeApi.getAllSizes();
            setSizes(response.data);
        } catch (error) {
            console.error("Failed to fetch sizes:", error);
            toast.error("Unable to load sizes list");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSizes().catch(() => {});
    }, [fetchSizes]);

    return { sizes, loading, fetchSizes };
}
