"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCategoryStore } from "@/stores/categoryStore";
import { Category } from "@/types";
import { Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FilterSection from "./FilterSection";

interface SearchFiltersProps {
    isMobile?: boolean;
    onClose?: () => void;
    initialCategories?: Category[];
    searchType?: "foods" | "restaurants";
    capabilities?: {
        hasRating: boolean;
        hasDeliveryTime: boolean;
        hasOpenNow: boolean;
        hasFreeShip: boolean;
    };
}

export default function SearchFilters({
    isMobile = false,
    onClose,
    initialCategories = [],
    searchType = "foods",
    capabilities = { hasRating: false, hasDeliveryTime: false, hasOpenNow: false, hasFreeShip: false },
}: SearchFiltersProps) {
    const { theme } = useClientTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { categories, fetchAllCategories } = useCategoryStore();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [nearbyMeters, setNearbyMeters] = useState<string>("");
    const [ratingMin, setRatingMin] = useState<string>("");
    const [deliveryMaxMinutes, setDeliveryMaxMinutes] = useState<string>("");
    const [openNowOnly, setOpenNowOnly] = useState(false);
    const [freeShipOnly, setFreeShipOnly] = useState(false);
    const PRICE_SLIDER_MIN = 0;
    const PRICE_SLIDER_MAX = 500000;
    const PRICE_SLIDER_STEP = 5000;
    const [priceMinVnd, setPriceMinVnd] = useState<number>(PRICE_SLIDER_MIN);
    const [priceMaxVnd, setPriceMaxVnd] = useState<number>(PRICE_SLIDER_MAX);
    const priceMinTooltipRef = useRef<HTMLDivElement | null>(null);
    const priceMaxTooltipRef = useRef<HTMLDivElement | null>(null);
    const sliderMin = 500;
    const sliderMax = 20000;

    useEffect(() => {
        const hasStoreCategories = !!(categories && categories.length > 0);
        const hasInitialCategories = initialCategories.length > 0;

        if (hasStoreCategories) return;

        if (hasInitialCategories) {
            useCategoryStore.setState({ categories: initialCategories });
            return;
        }

        fetchAllCategories();
    }, [categories, fetchAllCategories, initialCategories]);

    useEffect(() => {
        setSelectedCategories(searchParams.getAll("category") || []);

        const priceRange = searchParams.get("priceRange");
        if (priceRange) {
            if (priceRange.endsWith("+")) {
                const min = parseFloat(priceRange.replace("+", ""));
                if (!isNaN(min) && min > 0) {
                    setPriceMinVnd(Math.max(PRICE_SLIDER_MIN, Math.min(PRICE_SLIDER_MAX, Math.round(min))));
                    setPriceMaxVnd(PRICE_SLIDER_MAX);
                } else {
                    setPriceMinVnd(PRICE_SLIDER_MIN);
                    setPriceMaxVnd(PRICE_SLIDER_MAX);
                }
            } else {
                const [minStr, maxStr] = priceRange.split("-");
                const min = minStr ? parseFloat(minStr) : null;
                const max = maxStr ? parseFloat(maxStr) : null;
                const nextMin = min !== null && !isNaN(min) && min >= 0 ? Math.round(min) : PRICE_SLIDER_MIN;
                const nextMax = max !== null && !isNaN(max) && max > 0 ? Math.round(max) : PRICE_SLIDER_MAX;
                setPriceMinVnd(Math.max(PRICE_SLIDER_MIN, Math.min(PRICE_SLIDER_MAX, nextMin)));
                setPriceMaxVnd(Math.max(PRICE_SLIDER_MIN, Math.min(PRICE_SLIDER_MAX, nextMax)));
            }
        } else {
            setPriceMinVnd(PRICE_SLIDER_MIN);
            setPriceMaxVnd(PRICE_SLIDER_MAX);
        }

        setNearbyMeters(searchParams.get("nearby") || "");
        setRatingMin(searchParams.get("ratingMin") || "");
        setDeliveryMaxMinutes(searchParams.get("deliveryMaxMinutes") || "");
        setOpenNowOnly(searchParams.get("openNow") === "1");
        setFreeShipOnly(searchParams.get("freeShip") === "1");
    }, [searchParams]);

    useEffect(() => {
        if (priceMinVnd > priceMaxVnd) {
            setPriceMaxVnd(priceMinVnd);
        }
    }, [priceMinVnd, priceMaxVnd]);

    useEffect(() => {
        const minPercent = ((priceMinVnd - PRICE_SLIDER_MIN) / (PRICE_SLIDER_MAX - PRICE_SLIDER_MIN)) * 100;
        const maxPercent = ((priceMaxVnd - PRICE_SLIDER_MIN) / (PRICE_SLIDER_MAX - PRICE_SLIDER_MIN)) * 100;
        if (priceMinTooltipRef.current) {
            priceMinTooltipRef.current.style.left = `calc(${minPercent}% + 0px)`;
        }
        if (priceMaxTooltipRef.current) {
            priceMaxTooltipRef.current.style.left = `calc(${maxPercent}% + 0px)`;
        }
    }, [priceMinVnd, priceMaxVnd]);

    const updateURL = (updates: Record<string, string | string[] | null>) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.delete("page");

        Object.entries(updates).forEach(([key, value]) => {
            currentParams.delete(key);
            if (value === null || (Array.isArray(value) && value.length === 0)) {
                return;
            }
            if (Array.isArray(value)) {
                value.forEach((v) => currentParams.append(key, v));
            } else {
                currentParams.set(key, value);
            }
        });

        router.push(`/search?${currentParams.toString()}`, { scroll: false });
        if (onClose) onClose();
    };

    const handleCategoryToggle = (categoryName: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName],
        );
    };

    const handleClearAll = () => {
        setSelectedCategories([]);
        setPriceMinVnd(PRICE_SLIDER_MIN);
        setPriceMaxVnd(PRICE_SLIDER_MAX);
        setNearbyMeters("");
        setRatingMin("");
        setDeliveryMaxMinutes("");
        setOpenNowOnly(false);
        setFreeShipOnly(false);
        const type = searchParams.get("type");
        router.push(type ? `/search?type=${type}` : "/search", { scroll: false });
        if (onClose) onClose();
    };

    const hasAdvancedActiveFilters =
        (capabilities.hasRating && !!ratingMin) ||
        (capabilities.hasDeliveryTime && !!deliveryMaxMinutes) ||
        (capabilities.hasOpenNow && openNowOnly) ||
        (capabilities.hasFreeShip && freeShipOnly);
    const isPriceRangeActive = priceMinVnd > PRICE_SLIDER_MIN || priceMaxVnd < PRICE_SLIDER_MAX;

    const hasActiveFilters =
        (searchType === "foods" && selectedCategories.length > 0) ||
        (searchType === "foods" && isPriceRangeActive) ||
        !!nearbyMeters ||
        hasAdvancedActiveFilters;

    const activeFilterCount =
        (searchType === "foods" ? selectedCategories.length : 0) +
        (searchType === "foods" && isPriceRangeActive ? 1 : 0) +
        (nearbyMeters ? 1 : 0) +
        (capabilities.hasRating && ratingMin ? 1 : 0) +
        (capabilities.hasDeliveryTime && deliveryMaxMinutes ? 1 : 0) +
        (capabilities.hasOpenNow && openNowOnly ? 1 : 0) +
        (capabilities.hasFreeShip && freeShipOnly ? 1 : 0);

    const handleApplyFilters = () => {
        // These keys are UI-only URL params for client-side refinement.
        // Backend query builders ignore them and keep API contract unchanged.
        const updates: Record<string, string | string[] | null> = {
            nearby: nearbyMeters.trim() ? nearbyMeters.trim() : null,
            ratingMin: capabilities.hasRating && ratingMin ? ratingMin : null,
            deliveryMaxMinutes: capabilities.hasDeliveryTime && deliveryMaxMinutes ? deliveryMaxMinutes : null,
            openNow: capabilities.hasOpenNow && openNowOnly ? "1" : null,
            freeShip: capabilities.hasFreeShip && freeShipOnly ? "1" : null,
        };

        if (searchType === "foods") {
            updates.category = selectedCategories.length > 0 ? selectedCategories : null;
            let priceRangeValue: string | null = null;
            if (isPriceRangeActive) {
                if (priceMinVnd > PRICE_SLIDER_MIN && priceMaxVnd >= PRICE_SLIDER_MAX) {
                    priceRangeValue = `${priceMinVnd}+`;
                } else {
                    priceRangeValue = `${priceMinVnd}-${priceMaxVnd}`;
                }
            }
            updates.priceRange = priceRangeValue;
        }

        updateURL(updates);
    };

    const sliderValue = (() => {
        const parsed = Number(nearbyMeters || "5000");
        if (!Number.isFinite(parsed)) return 5000;
        return Math.max(sliderMin, Math.min(sliderMax, parsed));
    })();
    const sliderPercent = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100;
    const sliderTrackColor = theme === "dark" ? "#f97316" : "#ea580c";
    const sliderRestColor = theme === "dark" ? "rgba(255,255,255,0.16)" : "#e5e7eb";

    const panelClass = `flex flex-col p-4 rounded-xl border shadow-sm ${
        theme === "dark" ? "border-white/12 bg-[#11172a]" : "border-gray-200 bg-white"
    } ${isMobile ? "h-full" : "sticky top-24 max-h-[calc(100vh-120px)]"}`;

    const filterActions = (
        <div className={`sticky bottom-0 z-10 mt-4 flex-shrink-0 border-t px-1 pt-3 pb-1 ${theme === "dark" ? "border-white/10 bg-[#11172a]" : "border-gray-200 bg-white"}`}>
            <div className="flex gap-2">
            <Button type="button" onClick={handleClearAll} variant="brandOutline" className="flex-1 h-11 rounded-full" disabled={!hasActiveFilters}>
                Clear
            </Button>
            <Button type="button" onClick={handleApplyFilters} variant="brand" className="flex-1 h-11 rounded-full">
                Apply filters
            </Button>
            </div>
        </div>
    );

    const content = (
        <div className={panelClass}>
            <div className={`flex-shrink-0 flex items-center justify-between mb-4 pb-3 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white/95" : "text-gray-900"}`}>Filters</h3>
                    {activeFilterCount > 0 && (
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-orange/10 px-2 text-xs font-semibold text-brand-orange">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {isMobile ? (
                    <button type="button" onClick={onClose} className="p-1 rounded-full" aria-label="Close filters">
                        <X className={`w-5 h-5 ${theme === "dark" ? "text-white/70" : "text-gray-600"}`} />
                    </button>
                ) : (
                    hasActiveFilters && (
                        <Button type="button" onClick={handleClearAll} variant="brandGhost" size="sm" className="h-8 px-2">
                            <X className="w-4 h-4" />
                            Clear All
                        </Button>
                    )
                )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
            <FilterSection title="Radius (meters)">
                <div className="space-y-3">
                    <Input
                        type="range"
                        min={sliderMin}
                        max={sliderMax}
                        step={100}
                        value={sliderValue}
                        onChange={(e) => setNearbyMeters(e.target.value)}
                        className="h-2 cursor-pointer appearance-none rounded-lg border-0 px-0 py-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent
                            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full
                            [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:-mt-1.5
                            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:shadow-md"
                        style={{
                            background: `linear-gradient(to right, ${sliderTrackColor} 0%, ${sliderTrackColor} ${sliderPercent}%, ${sliderRestColor} ${sliderPercent}%, ${sliderRestColor} 100%)`,
                        }}
                    />
                    <div className="flex items-center justify-between text-xs">
                        <span className={theme === "dark" ? "text-white/65" : "text-gray-600"}>{sliderMin.toLocaleString("vi-VN")}m</span>
                        <span className="font-semibold text-brand-orange">
                            {sliderValue.toLocaleString("vi-VN")}m
                        </span>
                        <span className={theme === "dark" ? "text-white/65" : "text-gray-600"}>{sliderMax.toLocaleString("vi-VN")}m</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[500, 1000, 3000, 5000, 10000].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setNearbyMeters(String(preset))}
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                    Number(nearbyMeters || 5000) === preset
                                        ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                        : theme === "dark"
                                          ? "border-white/16 bg-white/6 text-white/80"
                                          : "border-gray-200 bg-white text-gray-700"
                                }`}
                            >
                                {`${preset.toLocaleString("vi-VN")}m`}
                            </button>
                        ))}
                    </div>
                </div>
            </FilterSection>

            {searchType === "foods" && (
                <>
                    <div className={`py-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                        <h5 className={`font-semibold text-sm mb-3 ${theme === "dark" ? "text-white/90" : "text-gray-900"}`}>Categories</h5>
                        {categories && categories.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.cateName}
                                        type="button"
                                        onClick={() => handleCategoryToggle(category.cateName)}
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                                            selectedCategories.includes(category.cateName)
                                                ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                                : theme === "dark"
                                                  ? "border-white/16 bg-white/6 text-white/80"
                                                  : "border-gray-200 bg-white text-gray-700"
                                        }`}
                                    >
                                        {selectedCategories.includes(category.cateName) && <Check className="h-3 w-3" />}
                                        {category.cateName}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-sm ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>Loading...</p>
                        )}
                    </div>

                    <FilterSection title="Price Range">
                        <div className="space-y-3">
                            <div className="px-6">
                                <div className="relative h-12 pt-4">
                                    <div
                                        ref={priceMinTooltipRef}
                                        className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-md bg-brand-orange px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white shadow-sm sm:px-2 sm:text-[10px]"
                                    >
                                        {priceMinVnd.toLocaleString("vi-VN")}₫
                                        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-3 border-x-transparent border-t-3 border-t-brand-orange sm:border-x-4 sm:border-t-4" />
                                    </div>
                                    <div
                                        ref={priceMaxTooltipRef}
                                        className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-md bg-brand-orange px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white shadow-sm sm:px-2 sm:text-[10px]"
                                    >
                                        {priceMaxVnd.toLocaleString("vi-VN")}₫
                                        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-3 border-x-transparent border-t-3 border-t-brand-orange sm:border-x-4 sm:border-t-4" />
                                    </div>
                                    <div className={`absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full ${theme === "dark" ? "bg-white/15" : "bg-gray-200"}`} />
                                    <input
                                        type="range"
                                        min={PRICE_SLIDER_MIN}
                                        max={PRICE_SLIDER_MAX}
                                        step={PRICE_SLIDER_STEP}
                                        value={priceMinVnd}
                                        onChange={(e) => {
                                            const next = Number(e.target.value);
                                            setPriceMinVnd(Math.min(next, priceMaxVnd - PRICE_SLIDER_STEP));
                                        }}
                                        className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:shadow-md"
                                        aria-label="Minimum price"
                                    />
                                    <input
                                        type="range"
                                        min={PRICE_SLIDER_MIN}
                                        max={PRICE_SLIDER_MAX}
                                        step={PRICE_SLIDER_STEP}
                                        value={priceMaxVnd}
                                        onChange={(e) => {
                                            const next = Number(e.target.value);
                                            setPriceMaxVnd(Math.max(next, priceMinVnd + PRICE_SLIDER_STEP));
                                        }}
                                        className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:shadow-md"
                                        aria-label="Maximum price"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className={theme === "dark" ? "text-white/65" : "text-gray-600"}>
                                    {PRICE_SLIDER_MIN.toLocaleString("vi-VN")}₫
                                </span>
                                <span className="font-semibold text-brand-orange">
                                    {priceMinVnd.toLocaleString("vi-VN")}₫ - {priceMaxVnd.toLocaleString("vi-VN")}₫
                                </span>
                                <span className={theme === "dark" ? "text-white/65" : "text-gray-600"}>
                                    {PRICE_SLIDER_MAX.toLocaleString("vi-VN")}₫
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[50000, 100000, 200000, 300000, 400000].map((presetMax) => (
                                    <button
                                        key={presetMax}
                                        type="button"
                                        onClick={() => {
                                            setPriceMinVnd(PRICE_SLIDER_MIN);
                                            setPriceMaxVnd(presetMax);
                                        }}
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                            priceMinVnd === PRICE_SLIDER_MIN && priceMaxVnd === presetMax
                                                ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                                : theme === "dark"
                                                  ? "border-white/16 bg-white/6 text-white/80"
                                                  : "border-gray-200 bg-white text-gray-700"
                                        }`}
                                    >
                                        {`<= ${presetMax.toLocaleString("vi-VN")}₫`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </FilterSection>
                </>
            )}

            {(capabilities.hasRating || capabilities.hasDeliveryTime || capabilities.hasOpenNow || capabilities.hasFreeShip) && (
                <div className={`py-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                    <h5 className={`font-semibold text-sm mb-3 ${theme === "dark" ? "text-white/90" : "text-gray-900"}`}>Quick filters</h5>

                    {capabilities.hasRating && (
                        <div className="mb-3">
                            <p className={`text-xs font-medium mb-1.5 ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>Min rating</p>
                            <div className="flex flex-wrap gap-2">
                                {["4.0", "4.5"].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRatingMin((prev) => (prev === value ? "" : value))}
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                            ratingMin === value
                                                ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                                : theme === "dark"
                                                  ? "border-white/16 bg-white/6 text-white/80"
                                                  : "border-gray-200 bg-white text-gray-700"
                                        }`}
                                    >
                                        {"\u2265"} {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {capabilities.hasDeliveryTime && (
                        <div className="mb-3">
                            <p className={`text-xs font-medium mb-1.5 ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>Delivery time</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: "< 20 min", value: "20" },
                                    { label: "< 30 min", value: "30" },
                                    { label: "< 45 min", value: "45" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setDeliveryMaxMinutes((prev) => (prev === option.value ? "" : option.value))}
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                            deliveryMaxMinutes === option.value
                                                ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                                : theme === "dark"
                                                  ? "border-white/16 bg-white/6 text-white/80"
                                                  : "border-gray-200 bg-white text-gray-700"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {capabilities.hasOpenNow && (
                            <button
                                type="button"
                                onClick={() => setOpenNowOnly((v) => !v)}
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                    openNowOnly
                                        ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                        : theme === "dark"
                                          ? "border-white/16 bg-white/6 text-white/80"
                                          : "border-gray-200 bg-white text-gray-700"
                                }`}
                            >
                                Open now
                            </button>
                        )}
                        {capabilities.hasFreeShip && (
                            <button
                                type="button"
                                onClick={() => setFreeShipOnly((v) => !v)}
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                    freeShipOnly
                                        ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                        : theme === "dark"
                                          ? "border-white/16 bg-white/6 text-white/80"
                                          : "border-gray-200 bg-white text-gray-700"
                                }`}
                            >
                                Free ship
                            </button>
                        )}
                    </div>
                </div>
            )}

            </div>
            {filterActions}
        </div>
    );

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
                <div
                    className={`fixed top-0 left-0 flex h-full w-[85%] max-w-sm flex-col shadow-2xl ${
                        theme === "dark" ? "bg-[#11172a]" : "bg-white"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {content}
                </div>
            </div>
        );
    }

    return <aside className="w-full lg:w-[280px] flex-shrink-0">{content}</aside>;
}