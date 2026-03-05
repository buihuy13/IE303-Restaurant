"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompactFoodCard } from "@/components/client/HomePage/CompactFoodCard";
import { CompactFoodCardSkeleton } from "@/components/client/HomePage/CompactFoodCardSkeleton";
import Pagination from "@/components/client/Pagination";
import SearchFilters from "@/components/client/search/SearchFilters";
import SearchSortBar from "@/components/client/search/SearchSortBar";
import { SearchResultsHeader } from "@/components/client/search/SearchResultsHeader";
import { SearchEmptyState } from "@/components/client/search/SearchEmptyState";
import { useSearchLocation } from "@/hooks/client/search/useSearchLocation";
import { useSearchProducts } from "@/hooks/client/search/useSearchProducts";
import { useSearchFilteredProducts } from "@/hooks/client/search/useSearchFilteredProducts";
import { Filter } from "lucide-react";

export default function SearchPageClient() {
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
        <div className="min-h-screen bg-gray-50">
            <div className="custom-container py-6">
                <div className="lg:hidden mb-4">
                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
                {isFilterOpen && <SearchFilters isMobile={true} onClose={() => setIsFilterOpen(false)} />}

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="hidden lg:block">
                        <SearchFilters />
                    </div>
                    <div className="flex-1 min-w-0">
                        <SearchResultsHeader
                            query={query}
                            productsLoading={productsLoading}
                            totalElements={totalElements}
                            currentPageNumber={currentPageNumber}
                            pageSize={PAGE_SIZE}
                            hasActiveFilters={hasActiveFilters}
                            onReset={() => {
                                router.push("/search", { scroll: false });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        />
                        <SearchSortBar />

                        {productsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <CompactFoodCardSkeleton key={`skeleton-${i}`} />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.map((product) => (
                                        <CompactFoodCard key={product.id} product={product} />
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <Pagination
                                            currentPage={currentPageNumber}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                            showInfo={true}
                                            scrollToTop={false}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <SearchEmptyState query={query} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
