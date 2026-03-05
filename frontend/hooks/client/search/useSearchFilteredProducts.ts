import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types";

export function useSearchFilteredProducts(products: Product[], sort: string): Product[] {
    const searchParams = useSearchParams();

    return useMemo(() => {
        let result = [...products];
        const specialFilters = searchParams.getAll("special");
        if (specialFilters.includes("favorite")) {
            result = result.filter((p) => (p.rating ?? 0) >= 4.5 || (p.totalReview ?? 0) > 50);
        }
        const ratingFilter = searchParams.get("rating");
        if (ratingFilter && sort !== "rating") {
            const minRating = parseFloat(ratingFilter);
            if (!isNaN(minRating)) result = result.filter((p) => (p.rating ?? 0) >= minRating);
        }
        return result;
    }, [products, searchParams, sort]);
}
