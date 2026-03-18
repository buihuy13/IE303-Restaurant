"use client";

import { initializeDefaultLocation, useLocationStore } from "@/stores/useLocationStore";
import { useProductStore } from "@/stores/useProductsStores";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { CompactFoodCard } from "./CompactFoodCard";
import { CompactFoodCardSkeleton } from "./CompactFoodCardSkeleton";

export default function FeaturedFoodPanel() {
    const { fetchAllProducts, products, loading: productsLoading } = useProductStore();
    const { currentAddress, isLocationSet } = useLocationStore();

    // Initialize default location if not set
    useEffect(() => {
        if (!isLocationSet || !currentAddress) {
            initializeDefaultLocation();
        }
    }, [isLocationSet, currentAddress]);

    useEffect(() => {
        // Don't fetch products until we have location coordinates
        if (!currentAddress || !isLocationSet) {
            return;
        }

        const params = new URLSearchParams();
        params.set("type", "foods");
        // Set location for distance calculation from current address
        params.set("lat", currentAddress.lat.toString());
        params.set("lon", currentAddress.lng.toString());
        fetchAllProducts(params);
    }, [fetchAllProducts, currentAddress, isLocationSet]);

    // Use API data from store (already ensured to be array by store)
    const productsToUse = products;

    // Get first 12 products
    const featuredProducts = useMemo(() => {
        if (!productsToUse || productsToUse.length === 0) return [];
        return productsToUse.slice(0, 12);
    }, [productsToUse]);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        Featured Foods
                    </h2>
                    <p className="text-sm text-gray-600">
                        {productsLoading ? "Loading..." : `${featuredProducts.length} featured items`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="brandOutline" size="sm" className="h-9 px-4">
                        <Link href="/search">View all</Link>
                    </Button>
                    <Button asChild variant="brandSoft" size="sm" className="h-9 px-4">
                        <Link href="/restaurants">Restaurants</Link>
                    </Button>
                </div>
            </div>

            {/* Food Grid - Responsive Layout */}
            {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <CompactFoodCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : featuredProducts && featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {featuredProducts.map((product) => (
                        <CompactFoodCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 min-h-[420px] rounded-2xl border border-dashed border-gray-200 bg-white/60 backdrop-blur-sm">
                    {/* Large Illustration */}
                    <div className="mb-6">
                        <svg
                            width="200"
                            height="200"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-gray-400"
                        >
                            <circle cx="100" cy="100" r="80" fill="currentColor" opacity="0.1" />
                            <path
                                d="M70 80C70 75.5817 73.5817 72 78 72H122C126.418 72 130 75.5817 130 80V120C130 124.418 126.418 128 122 128H78C73.5817 128 70 124.418 70 120V80Z"
                                fill="currentColor"
                                opacity="0.2"
                            />
                            <circle cx="90" cy="100" r="8" fill="currentColor" opacity="0.3" />
                            <circle cx="110" cy="100" r="8" fill="currentColor" opacity="0.3" />
                            <path
                                d="M85 115C85 113.343 86.3431 112 88 112H112C113.657 112 115 113.343 115 115C115 116.657 113.657 118 112 118H88C86.3431 118 85 116.657 85 115Z"
                                fill="currentColor"
                                opacity="0.3"
                            />
                        </svg>
                    </div>

                    {/* Empty State Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No featured foods available
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md text-center">
                        No featured items today, try searching for other foods?
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild variant="brand" className="h-12 px-6 shadow-md hover:shadow-lg">
                            <Link href="/restaurants">View All Restaurants</Link>
                        </Button>
                        <Button asChild variant="outline" className="h-12 px-6">
                            <Link href="/">Clear Filters</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

