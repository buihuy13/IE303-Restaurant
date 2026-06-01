"use client";

import Pagination from "@/components/client/Pagination";
import {
    buildProductSearchParamsFromUrl,
    buildRestaurantSearchParamsFromUrl,
    parseProductSort,
    parseRestaurantSort,
} from "@/lib/api/backendQueryParams";
import { useProductStore } from "@/stores/useProductsStores";
import { useRestaurantStore } from "@/stores/useRestaurantStore";
import { Category } from "@/types";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Utensils } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FoodCard } from "./FoodCard";
import { FoodCardSkeleton } from "./FoodCardSkeleton";
import { RestaurantCard } from "./RestaurantCard";
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton";

const categoryIcons: { [key: string]: string } = {
        Burger: "🍔",
        Pizza: "🍕",
        Sandwiches: "🥪",
        Wings: "🍗",
        Coffee: "☕",
        Tea: "🍵",
        Indian: "🍛",
        Chinese: "🥡",
        Thai: "🍜",
        American: "🇺🇸",
        Mexican: "🌮",
        Japanese: "🍣",
        // Add other categories if needed
};

export default function RestaurantList() {
        const searchParams = useSearchParams();
        const pathname = usePathname();
        const router = useRouter();
        const activeCategory = searchParams.get("category") || "";
        const scrollContainerRef = useRef<HTMLDivElement>(null);
        const ITEMS_PER_PAGE = 9;
        const {
                restaurants,
                getAllRestaurants,
                loading,
                categories,
                getAllCategories,
                restaurantsTotalElements,
                restaurantsTotalPages,
        } = useRestaurantStore();
        const {
                fetchAllProducts,
                products,
                loading: productsLoading,
                totalElements: productsTotalElements,
                totalPages: productsTotalPages,
        } = useProductStore();
        const searchType = searchParams.get("type") || "restaurants";

        // Layout state with localStorage persistence (only for food items)
        const [foodLayout, setFoodLayout] = useState<"grid" | "flex">(() => {
                if (typeof window !== "undefined") {
                        const saved = localStorage.getItem("foodCardLayout");
                        return (saved === "grid" || saved === "flex" ? saved : "grid") as "grid" | "flex";
                }
                return "grid";
        });

        // State to handle smooth layout transition
        const [isTransitioning, setIsTransitioning] = useState(false);

        // Save layout preference to localStorage
        useEffect(() => {
                if (typeof window !== "undefined") {
                        localStorage.setItem("foodCardLayout", foodLayout);
                }
        }, [foodLayout]);

        // Handle layout change with smooth transition
        const handleLayoutChange = useCallback((newLayout: "grid" | "flex") => {
                if (newLayout === foodLayout) return;
                
                setIsTransitioning(true);
                setTimeout(() => {
                        setFoodLayout(newLayout);
                        setTimeout(() => {
                                setIsTransitioning(false);
                        }, 100);
                }, 50);
        }, [foodLayout]);

        useEffect(() => {
                const lat = 10.7626;
                const lon = 106.6825;

                if (searchType === "restaurants") {
                        const params = buildRestaurantSearchParamsFromUrl(searchParams, lat, lon);
                        params.set("size", String(ITEMS_PER_PAGE));
                        getAllRestaurants(params, parseRestaurantSort(searchParams.get("sort")));
                } else if (searchType === "foods") {
                        const params = buildProductSearchParamsFromUrl(searchParams, lat, lon);
                        params.set("size", String(ITEMS_PER_PAGE));
                        fetchAllProducts(params, parseProductSort(searchParams.get("sort")));
                }
                getAllCategories();
        }, [getAllRestaurants, getAllCategories, fetchAllProducts, searchType, searchParams]);

        const handleCategoryClick = (categoryName: string) => {
                const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
                if (activeCategory === categoryName) {
                        currentParams.delete("category");
                } else {
                        currentParams.set("category", categoryName);
                }
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        };

        const handleScroll = (scrollOffset: number) => {
                if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
                }
        };

        const items = searchType === "restaurants" ? restaurants : products;
        const totalResults = searchType === "restaurants" ? restaurantsTotalElements : productsTotalElements;
        const title = searchType === "restaurants" ? "Restaurants" : "Food Items";
        const paginationTotalPages =
                searchType === "restaurants"
                        ? Math.max(restaurantsTotalPages, 1)
                        : Math.max(productsTotalPages, 1);

        return (
                <div>
                        {searchType === "foods" && (
                        <div className="mb-10">
                                <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                                                Explore by category
                                        </h2>
                                        <a href="#" className="text-sm font-semibold text-brand-orange hover:underline">
                                                View All
                                        </a>
                                </div>

                                <div className="flex items-center gap-2">
                                        {/* Left scroll button */}
                                        <button
                                                title="Scroll left"
                                                onClick={() => handleScroll(-300)}
                                                className="p-2 rounded-full bg-white shadow-sm cursor-pointer hidden md:block hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                                <ChevronLeft className="w-6 h-6" />
                                        </button>

                                        {/* Scroll bar */}
                                        <div
                                                ref={scrollContainerRef}
                                                className="flex-grow flex items-center gap-4 overflow-x-auto scrollbar-hide"
                                        >
                                                {categories.map((category: Category) => (
                                                        <button
                                                                key={category.cateName}
                                                                onClick={() => handleCategoryClick(category.cateName)}
                                                                className={`cursor-pointer capitalize flex flex-col items-center justify-center gap-2 flex-shrink-0 w-24 h-24 text-center p-3 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 border ${
                                                                        activeCategory === category.cateName
                                                                                ? "bg-brand-orange text-white shadow-sm border-brand-orange"
                                                                                : "bg-white hover:bg-gray-50 shadow-sm border-gray-200"
                                                                }`}
                                                        >
                                                                <span className="text-3xl">
                                                                        {categoryIcons[
                                                                                category.cateName
                                                                                        .charAt(0)
                                                                                        .toUpperCase() +
                                                                                        category.cateName.slice(1)
                                                                        ] || <Utensils />}
                                                                </span>
                                                                <span className="text-sm font-semibold truncate w-full">
                                                                        {category.cateName}
                                                                </span>
                                                        </button>
                                                ))}
                                        </div>

                                        {/* Right scroll button */}
                                        <button
                                                title="Scroll right"
                                                onClick={() => handleScroll(300)}
                                                className="p-2 rounded-full bg-white shadow-sm cursor-pointer hidden md:block hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                                <ChevronRight className="w-6 h-6" />
                                        </button>
                                </div>
                        </div>
                        )}

                        {/* --- List Header & Layout Toggle --- */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-lg md:text-xl font-bold tracking-tight text-gray-900">
                                        {loading || productsLoading ? (
                                                <span className="inline-block h-6 w-32 bg-gray-200 rounded animate-pulse"></span>
                                        ) : (
                                                `${totalResults} ${title} Found`
                                        )}
                                </h2>

                                {/* Layout Toggle - Only show for food items */}
                                {searchType === "foods" && !loading && !productsLoading && items && items.length > 0 && (
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                                                <button
                                                        onClick={() => handleLayoutChange("grid")}
                                                        disabled={isTransitioning}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                                foodLayout === "grid"
                                                                        ? "bg-brand-orange text-white shadow-sm"
                                                                        : "text-gray-600 hover:bg-gray-50"
                                                        } ${isTransitioning ? "opacity-50 cursor-wait" : ""}`}
                                                        title="Grid Layout"
                                                >
                                                        <LayoutGrid className="w-4 h-4" />
                                                </button>
                                                <button
                                                        onClick={() => handleLayoutChange("flex")}
                                                        disabled={isTransitioning}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                                                foodLayout === "flex"
                                                                        ? "bg-brand-orange text-white shadow-sm"
                                                                        : "text-gray-600 hover:bg-gray-50"
                                                        } ${isTransitioning ? "opacity-50 cursor-wait" : ""}`}
                                                        title="List Layout"
                                                >
                                                        <List className="w-4 h-4" />
                                                </button>
                                        </div>
                                )}
                        </div>

                        {/* Loading state with skeletons */}
                        {(loading || productsLoading) && (
                                <div
                                        className={`grid gap-6 ${
                                                searchType === "restaurants"
                                                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                                        }`}
                                >
                                        {Array.from({ length: 6 }).map((_, index) =>
                                                searchType === "restaurants" ? (
                                                        <RestaurantCardSkeleton key={`restaurant-skeleton-${index}`} />
                                                ) : (
                                                        <FoodCardSkeleton key={`food-skeleton-${index}`} />
                                                )
                                        )}
                                </div>
                        )}

                        {/* Content when loaded */}
                        {!loading && !productsLoading && items && items.length > 0 && (
                                <>
                                        <div
                                                className={`transition-[grid-template-columns,gap,flex-direction] duration-500 ease-in-out ${
                                                        isTransitioning ? "opacity-70" : "opacity-100"
                                                } ${
                                                        searchType === "restaurants"
                                                                ? `grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
                                                                : foodLayout === "grid"
                                                                ? `grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
                                                                : `flex flex-col gap-4`
                                                }`}
                                        >
                                                {searchType === "restaurants"
                                                        ? restaurants.map((restaurant) => (
                                                                  <RestaurantCard
                                                                          key={restaurant.id}
                                                                          restaurant={restaurant}
                                                                  />
                                                          ))
                                                        : products.map((product) => (
                                                                  <FoodCard
                                                                          key={product.id}
                                                                          product={product}
                                                                          layout={foodLayout}
                                                                  />
                                                          ))}
                                        </div>
                                        <Pagination
                                                currentPage={Number(searchParams.get("page")) || 1}
                                                totalPages={paginationTotalPages}
                                                showInfo={true}
                                                scrollToTop={true}
                                        />
                                </>
                        )}

                        {/* Empty state */}
                        {!loading && !productsLoading && (!items || items.length === 0) && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                                        <div className="text-5xl mb-3">🔎</div>
                                        <p className="text-gray-800 text-lg font-semibold">No {title} found</p>
                                        <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or search keywords.</p>
                                </div>
                        )}
                </div>
        );
}
