"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchPageView } from "@/components/client/search/SearchPageView";
import { useSearchLocation } from "@/hooks/client/search/useSearchLocation";
import { useSearchProducts } from "@/hooks/client/search/useSearchProducts";
import { useSearchRestaurants } from "@/hooks/client/search/useSearchRestaurants";
import { productApi } from "@/lib/api/productApi";
import {
    getRecommendationErrorMessage,
    isRecommendationForbiddenError,
    isRecommendationUnauthorizedError,
    parseMoodRecommendationResponse,
    recommendationApi,
} from "@/lib/api/recommendationApi";
import type { Category } from "@/types";
import type { Product } from "@/types";
import toast from "react-hot-toast";

interface SearchPageClientProps {
    initialCategories?: Category[];
}

export default function SearchPageClient({ initialCategories = [] }: SearchPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
    const [moodOptions, setMoodOptions] = useState<string[]>([]);
    const [isMoodOptionsLoading, setIsMoodOptionsLoading] = useState(false);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [moodSummary, setMoodSummary] = useState<string | null>(null);
    const [moodError, setMoodError] = useState<string | null>(null);
    const [moodProducts, setMoodProducts] = useState<Product[]>([]);
    const [isMoodLoading, setIsMoodLoading] = useState(false);

    const { currentAddress, isLocationSet } = useSearchLocation();
    const typeParam = searchParams.get("type");
    const searchType = (typeParam === "restaurants" ? "restaurants" : "foods") as "foods" | "restaurants";
    const fetchProducts = typeParam === null || typeParam === "foods";
    const fetchRestaurants = typeParam === null || typeParam === "restaurants";

    const productsState = useSearchProducts(currentAddress, isLocationSet, fetchProducts);
    const restaurantsState = useSearchRestaurants(currentAddress, isLocationSet, fetchRestaurants);
    const query = searchParams.get("q") || "";
    const filteredProducts = productsState.products;
    const productsLoading = searchType === "restaurants" ? restaurantsState.restaurantsLoading : productsState.productsLoading;
    const totalPages = searchType === "restaurants" ? restaurantsState.totalPages : productsState.totalPages;
    const totalElements = searchType === "restaurants" ? restaurantsState.totalElements : productsState.totalElements;
    const currentPageNumber =
        searchType === "restaurants" ? restaurantsState.currentPageNumber : productsState.currentPageNumber;
    const PAGE_SIZE = searchType === "restaurants" ? restaurantsState.PAGE_SIZE : productsState.PAGE_SIZE;

    const loadMoodOptions = useCallback(async () => {
        if (isMoodOptionsLoading || moodOptions.length > 0) return;
        setIsMoodOptionsLoading(true);
        try {
            const moods = await recommendationApi.getMoodOptions();
            setMoodOptions(moods);
            if (moods.length === 0) {
                setMoodError("Chưa có danh sách tâm trạng để gợi ý.");
            }
        } catch (error) {
            const message = getRecommendationErrorMessage(error);
            setMoodError(message || "Không tải được danh sách tâm trạng.");
        } finally {
            setIsMoodOptionsLoading(false);
        }
    }, [isMoodOptionsLoading, moodOptions.length]);

    useEffect(() => {
        if (!isMoodModalOpen) return;
        void loadMoodOptions();
    }, [isMoodModalOpen, loadMoodOptions]);

    const handleSelectMood = useCallback(
        async (mood: string) => {
            const lat = currentAddress?.lat ?? 10.7769;
            const lon = currentAddress?.lng ?? 106.7009;

            setMoodError(null);
            setIsMoodLoading(true);
            setSelectedMood(mood);
            setIsMoodModalOpen(false);
            try {
                const result = await recommendationApi.suggestFoodByMood(mood, lat, lon);
                const parsed = parseMoodRecommendationResponse(result.response);
                const recommendedIds =
                    parsed.data?.recommendations
                        ?.map((item) => item.productId?.trim())
                        .filter((id): id is string => !!id)
                        .filter((id, index, list) => list.indexOf(id) === index) ?? [];

                if (recommendedIds.length === 0) {
                    setMoodProducts([]);
                    setMoodSummary(parsed.data?.summary ?? parsed.fallbackSummary ?? "Không có món phù hợp cho tâm trạng này.");
                    return;
                }

                const detailResponses = await Promise.allSettled(
                    recommendedIds.slice(0, 12).map((id) => productApi.getProductById(id)),
                );
                const productMap = new Map<string, Product>();
                detailResponses.forEach((entry) => {
                    if (entry.status !== "fulfilled") return;
                    const product = entry.value?.data;
                    if (product?.id) {
                        productMap.set(String(product.id).trim(), product);
                    }
                });

                const orderedProducts = recommendedIds
                    .map((id) => productMap.get(id))
                    .filter((item): item is Product => !!item);

                setMoodProducts(orderedProducts);
                setMoodSummary(parsed.data?.summary ?? parsed.fallbackSummary ?? null);
            } catch (error) {
                const message = getRecommendationErrorMessage(error);
                if (isRecommendationUnauthorizedError(error) || isRecommendationForbiddenError(error)) {
                    setMoodError(message || "Bạn cần đăng nhập để nhận gợi ý theo tâm trạng.");
                } else {
                    setMoodError(message || "Không thể lấy gợi ý theo tâm trạng lúc này.");
                }
                toast.error(message || "Không thể lấy gợi ý theo tâm trạng.");
            } finally {
                setIsMoodLoading(false);
            }
        },
        [currentAddress?.lat, currentAddress?.lng],
    );

    const hasActiveFilters = (() => {
        const allowed = ["category", "priceRange", "nearby", "q", "search", "ratingMin", "deliveryMaxMinutes", "openNow", "freeShip"];
        for (const key of allowed) {
            if (searchType === "restaurants" && (key === "category" || key === "priceRange")) continue;
            if (searchParams.get(key) || searchParams.getAll(key).length > 0) return true;
        }
        return false;
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
            moodModalOpen={isMoodModalOpen}
            onOpenMoodModal={() => {
                setMoodError(null);
                setIsMoodModalOpen(true);
            }}
            onCloseMoodModal={() => setIsMoodModalOpen(false)}
            moodOptions={moodOptions}
            moodOptionsLoading={isMoodOptionsLoading}
            selectedMood={selectedMood}
            moodSummary={moodSummary}
            moodProducts={moodProducts}
            moodError={moodError}
            moodLoading={isMoodLoading}
            onSelectMood={handleSelectMood}
            onClearMoodRecommendation={() => {
                setSelectedMood(null);
                setMoodSummary(null);
                setMoodProducts([]);
                setMoodError(null);
            }}
        />
    );
}
