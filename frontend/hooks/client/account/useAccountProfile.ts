import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

/** Profile is hydrated by AuthProvider — no extra GET /users/accesstoken here. */
export function useAccountProfile() {
    const { user, loading } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return { user, loading, mounted };
}
