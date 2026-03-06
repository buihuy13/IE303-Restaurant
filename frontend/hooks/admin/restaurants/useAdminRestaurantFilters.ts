import { useMemo, useState } from "react";
import type { Restaurant } from "@/types";

export function useAdminRestaurantFilters(restaurants: Restaurant[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const filteredRestaurants = useMemo(() => {
        return restaurants.filter((restaurant) => {
            const matchesSearch =
                restaurant.resName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                filterStatus === "ALL" || (filterStatus === "ACTIVE" ? restaurant.enabled : !restaurant.enabled);
            return matchesSearch && matchesStatus;
        });
    }, [restaurants, searchTerm, filterStatus]);

    return {
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filteredRestaurants,
    };
}

