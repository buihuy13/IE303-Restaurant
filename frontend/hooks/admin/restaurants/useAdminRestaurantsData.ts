import { fetchAllRestaurantsPages } from "@/lib/api/restaurantApi";
import type { Restaurant } from "@/types";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useAdminRestaurantsData() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            const all = await fetchAllRestaurantsPages();
            setRestaurants(all);
        } catch (error) {
            console.error("Failed to fetch restaurants:", error);
            toast.error("Unable to load restaurants list");
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRestaurants().catch(() => {
            // error already handled in fetchRestaurants
        });
    }, [fetchRestaurants]);

    return { restaurants, loading, fetchRestaurants };
}

