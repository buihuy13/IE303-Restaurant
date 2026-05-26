import { useProductStore } from "@/stores/useProductsStores";
import {
    buildProductQueryParams,
    buildProductSearchParamsFromUrl,
    type ProductSearchSort,
} from "@/lib/api/backendQueryParams";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const DEFAULT_LIST_LAT = 10.7626;
const DEFAULT_LIST_LON = 106.6825;

export function useSearchProducts(
    currentAddress: { lat: number; lng: number } | null,
    _isLocationSet: boolean,
    enabled = true,
) {
    const searchParams = useSearchParams();
    const { fetchAllProducts, products, loading: productsLoading, totalPages, totalElements } = useProductStore();

    const query = searchParams.get("q") || "";
    const sort = (searchParams.get("sort") || "relevance") as ProductSearchSort;
    const pageParam = searchParams.get("page");
    const currentPageNumber = pageParam ? parseInt(pageParam, 10) : 1;

    useEffect(() => {
        if (!enabled) return;

        const lat = currentAddress?.lat ?? DEFAULT_LIST_LAT;
        const lon = currentAddress?.lng ?? DEFAULT_LIST_LON;
        const raw = buildProductSearchParamsFromUrl(searchParams, lat, lon);
        const apiParams = buildProductQueryParams(raw, sort);
        fetchAllProducts(apiParams, sort);
    }, [enabled, fetchAllProducts, searchParams, sort, query, currentAddress, currentPageNumber]);

    return {
        products,
        productsLoading: enabled ? productsLoading : false,
        totalPages,
        totalElements,
        query,
        currentPageNumber,
        PAGE_SIZE: 12,
    };
}
