"use client";

import { CompactFoodCard } from "@/components/client/HomePage/CompactFoodCard";
import { CompactFoodCardSkeleton } from "@/components/client/HomePage/CompactFoodCardSkeleton";
import Pagination from "@/components/client/Pagination";
import SearchFilters from "@/components/client/search/SearchFilters";
import SearchSortBar from "@/components/client/search/SearchSortBar";
import { SearchResultsHeader } from "@/components/client/search/SearchResultsHeader";
import { SearchEmptyState } from "@/components/client/search/SearchEmptyState";
import { Filter } from "lucide-react";
import type { Category, Product } from "@/types";

export interface SearchPageViewProps {
    isFilterOpen: boolean;
    onOpenFilters: () => void;
    onCloseFilters: () => void;
    query: string;
    productsLoading: boolean;
    totalElements: number;
    currentPageNumber: number;
    pageSize: number;
    hasActiveFilters: boolean;
    filteredProducts: Product[];
    initialCategories?: Category[];
    totalPages: number;
    onPageChange: (page: number) => void;
    onReset: () => void;
}

export function SearchPageView({
    isFilterOpen,
    onOpenFilters,
    onCloseFilters,
    query,
    productsLoading,
    totalElements,
    currentPageNumber,
    pageSize,
    hasActiveFilters,
    filteredProducts,
    initialCategories = [],
    totalPages,
    onPageChange,
    onReset,
}: SearchPageViewProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="custom-container py-6">
                <div className="lg:hidden mb-4">
                    <button
                        type="button"
                        onClick={onOpenFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
                {isFilterOpen && (
                    <SearchFilters
                        isMobile={true}
                        onClose={onCloseFilters}
                        initialCategories={initialCategories}
                    />
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="hidden lg:block">
                        <SearchFilters initialCategories={initialCategories} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <SearchResultsHeader
                            query={query}
                            productsLoading={productsLoading}
                            totalElements={totalElements}
                            currentPageNumber={currentPageNumber}
                            pageSize={pageSize}
                            hasActiveFilters={hasActiveFilters}
                            onReset={onReset}
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
                                            onPageChange={onPageChange}
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

