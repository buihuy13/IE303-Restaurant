"use client";

import { Button } from "@/components/ui/Button";

interface SearchResultsHeaderProps {
    searchType: "foods" | "restaurants";
    query: string;
    productsLoading: boolean;
    totalElements: number;
    currentPageNumber: number;
    pageSize: number;
    hasActiveFilters: boolean;
    onReset: () => void;
}

export function SearchResultsHeader({
    searchType,
    query,
    productsLoading,
    totalElements,
    currentPageNumber,
    pageSize,
    hasActiveFilters,
    onReset,
}: SearchResultsHeaderProps) {
    const summary =
        productsLoading
            ? "Loading..."
            : totalElements > 0
              ? `Showing ${(currentPageNumber - 1) * pageSize + 1}-${Math.min(currentPageNumber * pageSize, totalElements)} of ${totalElements} ${totalElements === 1 ? "result" : "results"}`
              : "No results found";

    return (
        <div className="mb-5">
            <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                    {query ? (
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
                            {searchType === "restaurants" ? "Restaurants" : "Food"} results for &quot;{query}&quot;
                        </h1>
                    ) : (
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
                            {searchType === "restaurants" ? "All Restaurants" : "All Food Items"}
                        </h1>
                    )}
                    <p className="text-sm text-gray-600">{summary}</p>
                    {productsLoading && (
                        <div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-gray-200/70">
                            <div className="h-full w-1/2 animate-[loaderbar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-orange to-orange-400" />
                        </div>
                    )}
                </div>
                {hasActiveFilters && (
                    <Button
                        type="button"
                        onClick={onReset}
                        variant="brandOutline"
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        Reset All
                    </Button>
                )}
            </div>
        </div>
    );
}
