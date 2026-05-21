import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { merchantApplicationApi } from "@/lib/api/merchantApplicationApi";
import type { MerchantApplication, ApplicationStatus } from "@/types";

export function useMerchantApplicationsData(statusFilter?: ApplicationStatus) {
    const [applications, setApplications] = useState<MerchantApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await merchantApplicationApi.getApplications(statusFilter);
            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch merchant applications:", error);
            toast.error("Failed to load merchant applications.");
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications().catch(() => {
            // error already handled in fetchApplications
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    return { applications, loading, fetchApplications };
}
