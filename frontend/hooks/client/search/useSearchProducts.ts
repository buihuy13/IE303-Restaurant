import { useProductStore } from "@/stores/useProductsStores";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const PAGE_SIZE = 12;

export function useSearchProducts(currentAddress: { lat: number; lng: number } | null, isLocationSet: boolean) {
    const searchParams = useSearchParams();
    const { fetchAllProducts, products, loading: productsLoading, totalPages, totalElements } = useProductStore();

    const query = searchParams.get("q") || "";
    const sort = searchParams.get("sort") || "relevance";
    const pageParam = searchParams.get("page");
    const currentPageNumber = pageParam ? parseInt(pageParam, 10) : 1;

    useEffect(() => {
        const params = new URLSearchParams();
        // Prefer real user coordinates when available.
        // If missing, store layer will inject safe defaults so backend requests don't fail.
        if (currentAddress) {
            params.set("lat", currentAddress.lat.toString());
            params.set("lon", currentAddress.lng.toString());
        }

        const nearby = searchParams.get("nearby");
        if (nearby?.trim()) params.set("nearby", nearby);

        const categoryParams = searchParams.getAll("category");
        if (categoryParams.length > 0) {
            params.set("category", categoryParams.map((c) => c.toLowerCase()).join(","));
        }
        if (query) params.set("search", query);

        if (sort === "distance") params.set("locationsorted", "asc");
        else if (sort === "rating" || sort === "popular") params.set("rating", "desc");

        const priceRange = searchParams.get("priceRange");
        if (priceRange) {
            const decoded = decodeURIComponent(priceRange);
            if (decoded.endsWith("+")) {
                const min = parseFloat(decoded.replace("+", ""));
                if (!isNaN(min) && min > 0) params.set("minPrice", min.toString());
            } else {
                const [min, max] = decoded.split("-");
                const minPrice = min ? parseFloat(min) : null;
                const maxPrice = max ? parseFloat(max) : null;
                if (minPrice != null && !isNaN(minPrice) && minPrice > 0) params.set("minPrice", minPrice.toString());
                if (maxPrice != null && !isNaN(maxPrice) && maxPrice > 0) params.set("maxPrice", maxPrice.toString());
            }
        }

        const page = currentPageNumber > 0 ? currentPageNumber - 1 : 0;
        params.set("page", page.toString());
        params.set("size", PAGE_SIZE.toString());
        fetchAllProducts(params);
    }, [fetchAllProducts, searchParams, sort, query, currentAddress, isLocationSet, currentPageNumber]);

    return {
        products,
        productsLoading,
        totalPages,
        totalElements,
        query,
        currentPageNumber,
        PAGE_SIZE,
    };
}
