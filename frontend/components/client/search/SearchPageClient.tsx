"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchPageView } from "@/components/client/search/SearchPageView";
import { useSearchLocation } from "@/hooks/client/search/useSearchLocation";
import { useSearchProducts } from "@/hooks/client/search/useSearchProducts";
import { useSearchFilteredProducts } from "@/hooks/client/search/useSearchFilteredProducts";
import type { Category } from "@/types";

interface SearchPageClientProps {
    initialCategories?: Category[];
}

export default function SearchPageClient({ initialCategories = [] }: SearchPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { currentAddress, isLocationSet } = useSearchLocation();
    const {
        products,
        productsLoading,
        totalPages,
        totalElements,
        query,
        currentPageNumber,
        PAGE_SIZE,
    } = useSearchProducts(currentAddress, isLocationSet);
    const sort = searchParams.get("sort") || "relevance";
    const filteredProducts = useSearchFilteredProducts(products, sort);

    const hasActiveFilters = !!(query || searchParams.toString().length > 0);

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
            query={query}
            productsLoading={productsLoading}
            totalElements={totalElements}
            currentPageNumber={currentPageNumber}
            pageSize={PAGE_SIZE}
            hasActiveFilters={hasActiveFilters}
            filteredProducts={filteredProducts}
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
