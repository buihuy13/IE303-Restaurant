"use client";

import { CompactFoodCard } from "@/components/client/HomePage/CompactFoodCard";
import { CompactFoodCardSkeleton } from "@/components/client/HomePage/CompactFoodCardSkeleton";
import Pagination from "@/components/client/Pagination";
import { FoodCard } from "@/components/client/restaurants/FoodCard";
import { RestaurantCard } from "@/components/client/restaurants/RestaurantCard";
import { RestaurantCardSkeleton } from "@/components/client/restaurants/RestaurantCardSkeleton";
import { ActiveFilterPills } from "@/components/client/search/ActiveFilterPills";
import { SearchEmptyState } from "@/components/client/search/SearchEmptyState";
import SearchFilters from "@/components/client/search/SearchFilters";
import { SearchResultsHeader } from "@/components/client/search/SearchResultsHeader";
import SearchSortBar from "@/components/client/search/SearchSortBar";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import type { Category, Product, Restaurant } from "@/types";
import { Filter, Flame, LayoutGrid, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

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
    const { theme } = useClientTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white">
            <div className="custom-container py-6 lg:py-10">
                <div className="lg:hidden mb-4">
                    <Button
                        type="button"
                        onClick={onOpenFilters}
                        variant="outline"
                        className="w-full justify-start gap-2 rounded-xl border-gray-200 bg-white shadow-sm"
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

                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    <div className="hidden lg:block w-full lg:w-[300px] flex-shrink-0">
                        <SearchFilters initialCategories={initialCategories} searchType={searchType} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="rounded-3xl border border-gray-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.06)] p-4 sm:p-6">
                            <div className="mb-5 flex items-center gap-2.5">
                                <Button
                                    type="button"
                                    variant={searchType === "foods" ? "brandSoft" : "secondary"}
                                    size="sm"
                                    className="rounded-full border border-transparent pr-3 shadow-sm"
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
                                    className="rounded-full border border-transparent pr-3 shadow-sm"
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
                            <div className={`mb-4 flex items-center justify-between gap-2 rounded-lg border-l-2 border-brand-orange px-3 py-2 ${
                                theme === "dark" ? "border-y border-r border-white/10 bg-white/5" : "border-y border-r border-gray-200 bg-gray-50"
                            }`}>
                                <p className={`text-xs sm:text-sm ${theme === "dark" ? "text-white/72" : "text-gray-700"}`}>
                                    <span className={`font-semibold ${theme === "dark" ? "text-white/92" : "text-gray-900"}`}>
                                        {searchType === "foods" ? "Foods" : "Restaurants"}
                                    </span>{" "}
                                    mode
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchTab(searchType === "foods" ? "restaurants" : "foods")}
                                    className="text-xs font-semibold text-brand-orange hover:underline"
                                >
                                    Switch
                                </button>
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
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <SearchSortBar searchType={searchType} />
                                {searchType === "foods" && (
                                    <div className={`inline-flex shrink-0 rounded-full border p-1 ${theme === "dark" ? "border-white/14 bg-white/6" : "border-gray-200 bg-white"}`}>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("grid")}
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                                                viewMode === "grid"
                                                    ? "bg-brand-orange text-white"
                                                    : theme === "dark"
                                                      ? "text-white/70"
                                                      : "text-gray-700"
                                            }`}
                                        >
                                            <LayoutGrid className="h-3.5 w-3.5" />
                                            Grid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("list")}
                                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                                                viewMode === "list"
                                                    ? "bg-brand-orange text-white"
                                                    : theme === "dark"
                                                      ? "text-white/70"
                                                      : "text-gray-700"
                                            }`}
                                        >
                                            <List className="h-3.5 w-3.5" />
                                            List
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!hasActiveFilters && (
                                <div className="mb-4">
                                    <div className={`text-sm font-semibold mb-2 flex items-center gap-2 ${theme === "dark" ? "text-white/85" : "text-gray-800"}`}>
                                        <Flame className="h-4 w-4 text-brand-orange" />
                                        {searchType === "restaurants" ? "Popular restaurants" : "Trending categories"}
                                    </div>
                                    {searchType === "restaurants" ? (
                                        <div className="flex flex-wrap gap-2">
                                            {productsLoading ? (
                                                <>
                                                    {Array.from({ length: 8 }).map((_, i) => (
                                                        <div
                                                            key={`popular-skeleton-${i}`}
                                                            className={`h-9 w-28 rounded-full animate-pulse ${
                                                                theme === "dark"
                                                                    ? "bg-white/10 border border-white/14"
                                                                    : "bg-white border border-gray-200/70"
                                                            }`}
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
                                                            className={`rounded-full border shadow-sm ${
                                                                theme === "dark"
                                                                    ? "border-white/16 bg-white/10 text-white/92 hover:bg-white/16"
                                                                    : "border-gray-200/70 bg-white hover:bg-gray-100"
                                                            }`}
                                                            onClick={() => router.push(`/restaurants/${r.slug}`)}
                                                        >
                                                            {r.resName}
                                                        </Button>
                                                    ))}
                                                </>
                                            )}
                                            {!productsLoading && restaurants.length === 0 && (
                                                <div className={`text-sm ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>
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
                                                            className={`h-9 w-24 rounded-full animate-pulse ${
                                                                theme === "dark"
                                                                    ? "bg-white/10 border border-white/14"
                                                                    : "bg-white border border-gray-200/70"
                                                            }`}
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
                                                            className={`rounded-full border shadow-sm ${
                                                                theme === "dark"
                                                                    ? "border-white/16 bg-white/10 text-white/92 hover:bg-white/16"
                                                                    : "border-gray-200/70 bg-white hover:bg-gray-100"
                                                            }`}
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
                                                <div className={`text-sm ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>
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
                                            : viewMode === "list"
                                              ? "grid grid-cols-1 gap-5"
                                              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6"
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
                                    <div className={viewMode === "list" ? "grid grid-cols-1 gap-5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6"}>
                                        {filteredProducts.map((product) => (
                                            viewMode === "list" ? (
                                                <FoodCard key={product.id} product={product} layout="flex" />
                                            ) : (
                                                <CompactFoodCard key={product.id} product={product} />
                                            )
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

