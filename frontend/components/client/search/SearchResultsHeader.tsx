"use client";

interface SearchResultsHeaderProps {
    query: string;
    productsLoading: boolean;
    totalElements: number;
    currentPageNumber: number;
    pageSize: number;
    hasActiveFilters: boolean;
    onReset: () => void;
}

export function SearchResultsHeader({
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
        <div className="mb-4">
            <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                    {query ? (
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Search results for &quot;{query}&quot;
                        </h1>
                    ) : (
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">All Food Items</h1>
                    )}
                    <p className="text-sm text-gray-500">{summary}</p>
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="px-4 py-2 text-sm font-medium text-[#EE4D2D] hover:text-[#EE4D2D]/80 hover:bg-[#EE4D2D]/10 rounded-lg border border-[#EE4D2D]/30 hover:border-[#EE4D2D] transition-colors whitespace-nowrap"
                    >
                        Reset All
                    </button>
                )}
            </div>
        </div>
    );
}
