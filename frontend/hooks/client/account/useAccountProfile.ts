import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export function useAccountProfile() {
    const { user, fetchProfile, loading } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchProfile();
    }, [fetchProfile]);

    return { user, loading, mounted };
}
