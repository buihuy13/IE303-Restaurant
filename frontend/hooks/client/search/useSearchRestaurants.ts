import { restaurantApi } from "@/lib/api/restaurantApi";
import type { Restaurant } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 12;
const FILTERED_FETCH_SIZE = 60;

function parseTimeToMinutes(hhmm: string) {
    const [h, m] = hhmm.split(":");
    const hh = Number(h);
    const mm = Number(m);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
    return hh * 60 + mm;
}

function isOpenNow(openingTime: string, closingTime: string, now = new Date()) {
    const openMin = parseTimeToMinutes(openingTime);
    const closeMin = parseTimeToMinutes(closingTime);
    if (openMin == null || closeMin == null) return false;

    const nowMin = now.getHours() * 60 + now.getMinutes();

    // If closes after midnight (e.g. 18:00 - 02:00)
    if (closeMin < openMin) {
        return nowMin >= openMin || nowMin <= closeMin;
    }
    return nowMin >= openMin && nowMin <= closeMin;
}

function matchesDistanceRange(distanceKm: number | null | undefined, raw: string) {
    if (!raw) return true;
    if (distanceKm == null || !Number.isFinite(distanceKm)) return false;

    const decoded = decodeURIComponent(raw);
    if (decoded.endsWith("+")) {
        const min = Number(decoded.replace("+", ""));
        if (!Number.isFinite(min)) return true;
        return distanceKm >= min;
    }

    const [minS, maxS] = decoded.split("-");
    const min = minS ? Number(minS) : 0;
    const max = maxS ? Number(maxS) : null;
    if (!Number.isFinite(min)) return true;
    if (max == null || !Number.isFinite(max)) return distanceKm >= min;
    return distanceKm >= min && distanceKm <= max;
}

export function useSearchRestaurants(
    currentAddress: { lat: number; lng: number } | null,
    isLocationSet: boolean,
) {
    const searchParams = useSearchParams();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [restaurantsLoading, setRestaurantsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const query = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "relevance";
    const pageParam = searchParams.get("page");
    const currentPageNumber = pageParam ? parseInt(pageParam, 10) : 1;
    const openNowFilter = searchParams.get("openNow") === "1";
    const distanceRange = searchParams.get("distanceRange") || "";
    const hasClientSideFilters = openNowFilter || !!distanceRange;

    useEffect(() => {
        const run = async () => {
            setRestaurantsLoading(true);
            try {
                const params = new URLSearchParams();
                if (currentAddress) {
                    params.set("lat", currentAddress.lat.toString());
                    params.set("lon", currentAddress.lng.toString());
                }

                if (query) params.set("search", query);

                const ratingFilter = searchParams.get("rating");
                if (ratingFilter) params.set("rating", ratingFilter);

                const district = searchParams.get("district");
                if (district) params.set("district", district);

                if (sort === "distance") params.set("locationsorted", "asc");
                else if (sort === "rating" || sort === "popular") params.set("rating", "desc");

                const page = hasClientSideFilters ? 0 : currentPageNumber > 0 ? currentPageNumber - 1 : 0;
                params.set("page", page.toString());
                params.set("size", (hasClientSideFilters ? FILTERED_FETCH_SIZE : PAGE_SIZE).toString());

                const res = await restaurantApi.getAllRestaurants(params);
                const data = res.data;
                const raw = Array.isArray(data?.content) ? data.content : [];
                const filtered = hasClientSideFilters
                    ? raw.filter((r) => {
                          if (openNowFilter && !isOpenNow(r.openingTime, r.closingTime)) return false;
                          if (distanceRange && !matchesDistanceRange(r.distance, distanceRange)) return false;
                          return true;
                      })
                    : raw;

                setRestaurants(filtered);
                if (hasClientSideFilters) {
                    setTotalElements(filtered.length);
                    setTotalPages(filtered.length > 0 ? 1 : 0);
                } else {
                    setTotalElements(typeof data?.totalElements === "number" ? data.totalElements : 0);
                    setTotalPages(typeof data?.totalPages === "number" ? data.totalPages : 0);
                }
            } catch {
                setRestaurants([]);
                setTotalElements(0);
                setTotalPages(0);
            } finally {
                setRestaurantsLoading(false);
            }
        };

        run();
    }, [
        searchParams,
        sort,
        query,
        currentAddress,
        isLocationSet,
        currentPageNumber,
        openNowFilter,
        distanceRange,
        hasClientSideFilters,
    ]);

    return {
        restaurants,
        restaurantsLoading,
        totalPages,
        totalElements,
        query,
        currentPageNumber,
        PAGE_SIZE: hasClientSideFilters ? FILTERED_FETCH_SIZE : PAGE_SIZE,
    };
}

