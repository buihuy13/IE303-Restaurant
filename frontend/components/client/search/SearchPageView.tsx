"use client";

import { CompactFoodCard } from "@/components/client/HomePage/CompactFoodCard";
import { CompactFoodCardSkeleton } from "@/components/client/HomePage/CompactFoodCardSkeleton";
import Pagination from "@/components/client/Pagination";
import { RestaurantCard } from "@/components/client/restaurants/RestaurantCard";
import { RestaurantCardSkeleton } from "@/components/client/restaurants/RestaurantCardSkeleton";
import { ActiveFilterPills } from "@/components/client/search/ActiveFilterPills";
import { SearchEmptyState } from "@/components/client/search/SearchEmptyState";
import SearchFilters from "@/components/client/search/SearchFilters";
import { SearchResultsHeader } from "@/components/client/search/SearchResultsHeader";
import SearchSortBar from "@/components/client/search/SearchSortBar";
import { Button } from "@/components/ui/Button";
import type { Category, Product, Restaurant } from "@/types";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const TAB_PARAMS_KEY = "search:tabParams";

function readTabParams(type: "foods" | "restaurants") {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(`${TAB_PARAMS_KEY}:${type}`);
        if (!raw) return null;
        return new URLSearchParams(raw);
    } catch {
        return null;
    }
}

function writeTabParams(type: "foods" | "restaurants", params: URLSearchParams) {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(`${TAB_PARAMS_KEY}:${type}`, params.toString());
    } catch {
        // ignore storage failures
    }
}

export interface SearchPageViewProps {
    isFilterOpen: boolean;
    onOpenFilters: () => void;
    onCloseFilters: () => void;
    searchType: "foods" | "restaurants";
    query: string;
    productsLoading: boolean;
    totalElements: number;
    currentPageNumber: number;
    pageSize: number;
    hasActiveFilters: boolean;
    filteredProducts: Product[];
    restaurants: Restaurant[];
    initialCategories?: Category[];
    totalPages: number;
    onPageChange: (page: number) => void;
    onReset: () => void;
}

export function SearchPageView({
    isFilterOpen,
    onOpenFilters,
    onCloseFilters,
    searchType,
    query,
    productsLoading,
    totalElements,
    currentPageNumber,
    pageSize,
    hasActiveFilters,
    filteredProducts,
    restaurants,
    initialCategories = [],
    totalPages,
    onPageChange,
    onReset,
}: SearchPageViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeFilterCount = useMemo(() => {
        const categories = searchParams.getAll("category").length;
        const price = searchParams.get("priceRange") ? 1 : 0;
        const rating = searchParams.get("rating") ? 1 : 0;
        const district = searchParams.get("district") ? 1 : 0;
        const openNow = searchParams.get("openNow") ? 1 : 0;
        const distance = searchParams.get("distanceRange") ? 1 : 0;
        return categories + price + rating + district + openNow + distance;
    }, [searchParams]);

    const handleSwitchTab = (nextType: "foods" | "restaurants") => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        // Save current tab params (exclude type + paging)
        const toSave = new URLSearchParams(current);
        toSave.delete("type");
        toSave.delete("page");
        writeTabParams(searchType, toSave);

        // Restore next tab params (if any), but keep the current query (q) to avoid surprises
        const restored = readTabParams(nextType) ?? new URLSearchParams();
        const q = current.get("q");
        restored.set("type", nextType);
        restored.delete("page");
        if (q) restored.set("q", q);
        else restored.delete("q");

        router.push(`/search?${restored.toString()}`, { scroll: false });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
            <div className="custom-container py-6 lg:py-8">
                <div className="lg:hidden mb-4">
                    <Button
                        type="button"
                        onClick={onOpenFilters}
                        variant="outline"
                        className="w-full justify-start gap-2 bg-white"
                    >
                        <Filter className="w-4 h-4" />
                        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    </Button>
                </div>
                {isFilterOpen && (
                    <SearchFilters
                        isMobile={true}
                        onClose={onCloseFilters}
                        initialCategories={initialCategories}
                        searchType={searchType}
                    />
                )}

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="hidden lg:block w-full lg:w-[300px] flex-shrink-0">
                        <SearchFilters initialCategories={initialCategories} searchType={searchType} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6">
                            <div className="mb-5 flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant={searchType === "foods" ? "brandSoft" : "secondary"}
                                    size="sm"
                                    className="rounded-full pr-3"
                                    onClick={() => {
                                        handleSwitchTab("foods");
                                    }}
                                    aria-pressed={searchType === "foods"}
                                >
                                    Foods
                                    {searchType === "foods" && (
                                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-brand-orange animate-pulse" aria-hidden="true" />
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant={searchType === "restaurants" ? "brandSoft" : "secondary"}
                                    size="sm"
                                    className="rounded-full pr-3"
                                    onClick={() => {
                                        handleSwitchTab("restaurants");
                                    }}
                                    aria-pressed={searchType === "restaurants"}
                                >
                                    Restaurants
                                    {searchType === "restaurants" && (
                                        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-brand-orange animate-pulse" aria-hidden="true" />
                                    )}
                                </Button>
                            </div>
                            <div className="mb-6 rounded-2xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <span
                                            className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-brand-orange shrink-0 animate-[pulse_2.2s_ease-in-out_infinite]"
                                            aria-hidden="true"
                                        />
                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold text-gray-900">
                                                You’re searching {searchType === "foods" ? "Foods" : "Restaurants"}.
                                            </span>{" "}
                                            <span className="text-gray-600">
                                                {searchType === "foods"
                                                    ? "Want to find a restaurant instead?"
                                                    : "Want to find food items instead?"}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="brand"
                                        size="sm"
                                        className="rounded-full h-9 px-4 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-orange/20"
                                        onClick={() => {
                                        handleSwitchTab(searchType === "foods" ? "restaurants" : "foods");
                                        }}
                                    >
                                        Switch to {searchType === "foods" ? "Restaurants" : "Foods"}
                                    </Button>
                                </div>
                            </div>
                            <SearchResultsHeader
                                searchType={searchType}
                                query={query}
                                productsLoading={productsLoading}
                                totalElements={totalElements}
                                currentPageNumber={currentPageNumber}
                                pageSize={pageSize}
                                hasActiveFilters={hasActiveFilters}
                                onReset={onReset}
                            />
                            <ActiveFilterPills />
                            <SearchSortBar searchType={searchType} />

                            {!hasActiveFilters && (
                                <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                                    <div className="text-sm font-semibold text-gray-900 mb-2">
                                        {searchType === "restaurants"
                                            ? "Popular restaurants"
                                            : "Trending categories"}
                                    </div>
                                    {searchType === "restaurants" ? (
                                        <div className="flex flex-wrap gap-2">
                                            {productsLoading ? (
                                                <>
                                                    {Array.from({ length: 8 }).map((_, i) => (
                                                        <div
                                                            key={`popular-skeleton-${i}`}
                                                            className="h-9 w-28 rounded-full bg-white border border-gray-200/70 animate-pulse"
                                                            aria-hidden="true"
                                                        />
                                                    ))}
                                                </>
                                            ) : (
                                                <>
                                                    {restaurants.slice(0, 8).map((r) => (
                                                        <Button
                                                            key={r.id}
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            className="rounded-full bg-white border border-gray-200/70 hover:bg-gray-100"
                                                            onClick={() => router.push(`/restaurants/${r.slug}`)}
                                                        >
                                                            {r.resName}
                                                        </Button>
                                                    ))}
                                                </>
                                            )}
                                            {!productsLoading && restaurants.length === 0 && (
                                                <div className="text-sm text-gray-600">
                                                    Start typing to discover restaurants near you.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {productsLoading ? (
                                                <>
                                                    {Array.from({ length: 10 }).map((_, i) => (
                                                        <div
                                                            key={`trending-skeleton-${i}`}
                                                            className="h-9 w-24 rounded-full bg-white border border-gray-200/70 animate-pulse"
                                                            aria-hidden="true"
                                                        />
                                                    ))}
                                                </>
                                            ) : (
                                                <>
                                                    {initialCategories.slice(0, 10).map((c) => (
                                                        <Button
                                                            key={c.cateName}
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            className="rounded-full bg-white border border-gray-200/70 hover:bg-gray-100"
                                                            onClick={() => {
                                                                const p = new URLSearchParams(Array.from(searchParams.entries()));
                                                                p.set("type", "foods");
                                                                p.delete("page");
                                                                p.delete("category");
                                                                p.append("category", c.cateName);
                                                                router.push(`/search?${p.toString()}`, { scroll: false });
                                                            }}
                                                        >
                                                            {c.cateName}
                                                        </Button>
                                                    ))}
                                                </>
                                            )}
                                            {!productsLoading && initialCategories.length === 0 && (
                                                <div className="text-sm text-gray-600">
                                                    Try searching for a dish name, or explore filters.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {productsLoading ? (
                                <div
                                    className={
                                        searchType === "restaurants"
                                            ? "grid grid-cols-1 gap-4 md:gap-6"
                                            : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
                                    }
                                >
                                    {Array.from({ length: 8 }).map((_, i) =>
                                        searchType === "restaurants" ? (
                                            <RestaurantCardSkeleton key={`skeleton-${i}`} />
                                        ) : (
                                            <CompactFoodCardSkeleton key={`skeleton-${i}`} />
                                        ),
                                    )}
                                </div>
                            ) : searchType === "restaurants" ? (
                                restaurants.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                                            {restaurants.map((restaurant) => (
                                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                            ))}
                                        </div>
                                        {totalPages > 1 && (
                                            <div className="mt-10 flex justify-center">
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
                                )
                            ) : filteredProducts.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                        {filteredProducts.map((product) => (
                                            <CompactFoodCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="mt-10 flex justify-center">
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
        </div>
    );
}

