import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { restaurantApi } from "@/lib/api/restaurantApi";
import type { Restaurant } from "@/types";

export function useAdminRestaurantsData() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRestaurants = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ lat: "10.9032198", lon: "106.7750317" });
            const response = await restaurantApi.getAllRestaurants(params);
            const restaurantData = response.data?.content || response.data;
            setRestaurants(Array.isArray(restaurantData) ? restaurantData : []);
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

