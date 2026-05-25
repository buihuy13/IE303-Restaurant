import { restaurantApi } from "@/lib/api/restaurantApi";
import {
    buildRestaurantQueryParams,
    buildRestaurantSearchParamsFromUrl,
    type RestaurantSearchSort,
} from "@/lib/api/backendQueryParams";
import type { Restaurant } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const DEFAULT_LIST_LAT = 10.9032198;
const DEFAULT_LIST_LON = 106.7750317;

export function useSearchRestaurants(
    currentAddress: { lat: number; lng: number } | null,
    _isLocationSet: boolean,
    enabled = true,
) {
    const searchParams = useSearchParams();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [restaurantsLoading, setRestaurantsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const query = searchParams.get("q") || "";
    const sort = (searchParams.get("sort") || "relevance") as RestaurantSearchSort;
    const pageParam = searchParams.get("page");
    const currentPageNumber = pageParam ? parseInt(pageParam, 10) : 1;

    useEffect(() => {
        if (!enabled) return;

        const run = async () => {
            setRestaurantsLoading(true);
            try {
                const lat = currentAddress?.lat ?? DEFAULT_LIST_LAT;
                const lon = currentAddress?.lng ?? DEFAULT_LIST_LON;
                const raw = buildRestaurantSearchParamsFromUrl(searchParams, lat, lon);
                const apiParams = buildRestaurantQueryParams(raw, sort);

                const res = await restaurantApi.getAllRestaurants(apiParams, sort);
                const data = res.data;
                setRestaurants(Array.isArray(data?.content) ? data.content : []);
                setTotalElements(typeof data?.totalElements === "number" ? data.totalElements : 0);
                setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 0);
            } catch {
                setRestaurants([]);
                setTotalElements(0);
                setTotalPages(0);
            } finally {
                setRestaurantsLoading(false);
            }
        };

        run();
    }, [enabled, searchParams, sort, query, currentAddress]);

    return {
        restaurants,
        restaurantsLoading: enabled ? restaurantsLoading : false,
        totalPages,
        totalElements,
        query,
        currentPageNumber,
        PAGE_SIZE: 12,
    };
}
