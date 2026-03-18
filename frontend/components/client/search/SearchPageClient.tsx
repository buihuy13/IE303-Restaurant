"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchPageView } from "@/components/client/search/SearchPageView";
import { useSearchLocation } from "@/hooks/client/search/useSearchLocation";
import { useSearchProducts } from "@/hooks/client/search/useSearchProducts";
import { useSearchFilteredProducts } from "@/hooks/client/search/useSearchFilteredProducts";
import { useSearchRestaurants } from "@/hooks/client/search/useSearchRestaurants";
import type { Category } from "@/types";

interface SearchPageClientProps {
    initialCategories?: Category[];
}

export default function SearchPageClient({ initialCategories = [] }: SearchPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { currentAddress, isLocationSet } = useSearchLocation();
    const searchType = (searchParams.get("type") || "foods") as "foods" | "restaurants";

    const productsState = useSearchProducts(currentAddress, isLocationSet);
    const restaurantsState = useSearchRestaurants(currentAddress, isLocationSet);
    const sort = searchParams.get("sort") || "relevance";
    const filteredProducts = useSearchFilteredProducts(productsState.products, sort);

    const query = searchType === "restaurants" ? restaurantsState.query : productsState.query;
    const productsLoading = searchType === "restaurants" ? restaurantsState.restaurantsLoading : productsState.productsLoading;
    const totalPages = searchType === "restaurants" ? restaurantsState.totalPages : productsState.totalPages;
    const totalElements = searchType === "restaurants" ? restaurantsState.totalElements : productsState.totalElements;
    const currentPageNumber =
        searchType === "restaurants" ? restaurantsState.currentPageNumber : productsState.currentPageNumber;
    const PAGE_SIZE = searchType === "restaurants" ? restaurantsState.PAGE_SIZE : productsState.PAGE_SIZE;

    const hasActiveFilters = (() => {
        if (query) return true;
        const p = new URLSearchParams(Array.from(searchParams.entries()));
        p.delete("type");
        p.delete("sort");
        p.delete("page");
        return p.toString().length > 0;
    })();

    const handlePageChange = (newPage: number) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        if (newPage === 1) currentParams.delete("page");
        else currentParams.set("page", newPage.toString());
        router.push(`/search?${currentParams.toString()}`, { scroll: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <SearchPageView
            isFilterOpen={isFilterOpen}
            onOpenFilters={() => setIsFilterOpen(true)}
            onCloseFilters={() => setIsFilterOpen(false)}
            searchType={searchType}
            query={query}
            productsLoading={productsLoading}
            totalElements={totalElements}
            currentPageNumber={currentPageNumber}
            pageSize={PAGE_SIZE}
            hasActiveFilters={hasActiveFilters}
            filteredProducts={filteredProducts}
            restaurants={restaurantsState.restaurants}
            initialCategories={initialCategories}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onReset={() => {
                router.push("/search", { scroll: false });
                window.scrollTo({ top: 0, behavior: "smooth" });
            }}
        />
    );
}
