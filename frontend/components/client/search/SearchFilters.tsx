"use client";

import { Button } from "@/components/ui/Button";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCategoryStore } from "@/stores/categoryStore";
import { Category } from "@/types";
import { Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FilterSection from "./FilterSection";

// Prices are stored and searched in USD directly

const ratingOptions = [
    { value: "5", label: "5 stars" },
    { value: "4", label: "4 stars and above" },
    { value: "3", label: "3 stars and above" },
];

const districts = [
    "District 1",
    "District 2",
    "District 3",
    "District 4",
    "District 5",
    "District 7",
    "Binh Thanh District",
    "Tan Binh District",
    "Phu Nhuan District",
];

const distanceOptions = [
    { value: "", label: "Any distance" },
    { value: "0-3", label: "Within 3 km" },
    { value: "0-5", label: "Within 5 km" },
    { value: "0-10", label: "Within 10 km" },
    { value: "10+", label: "10+ km" },
];

interface SearchFiltersProps {
    isMobile?: boolean;
    onClose?: () => void;
    initialCategories?: Category[];
    searchType?: "foods" | "restaurants";
}

export default function SearchFilters({
    isMobile = false,
    onClose,
    initialCategories = [],
    searchType = "foods",
}: SearchFiltersProps) {
    const { theme } = useClientTheme();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { categories, fetchAllCategories } = useCategoryStore();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [minPriceUSD, setMinPriceUSD] = useState<string>("");
    const [maxPriceUSD, setMaxPriceUSD] = useState<string>("");
    const [selectedRating, setSelectedRating] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [openNow, setOpenNow] = useState<boolean>(false);
    const [distanceRange, setDistanceRange] = useState<string>("");

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
        // Sync with URL params
        setSelectedCategories(searchParams.getAll("category") || []);
        
        // Parse price range from URL (USD) - direct, no conversion needed
        const priceRange = searchParams.get("priceRange");
        if (priceRange) {
            if (priceRange.endsWith("+")) {
                const minUSD = parseFloat(priceRange.replace("+", ""));
                if (!isNaN(minUSD) && minUSD > 0) {
                    setMinPriceUSD(minUSD.toFixed(2));
                    setMaxPriceUSD("");
                }
            } else {
                const [min, max] = priceRange.split("-");
                const minUSD = min ? parseFloat(min) : null;
                const maxUSD = max ? parseFloat(max) : null;
                if (minUSD !== null && !isNaN(minUSD) && minUSD > 0) {
                    setMinPriceUSD(minUSD.toFixed(2));
                } else {
                    setMinPriceUSD("");
                }
                if (maxUSD !== null && !isNaN(maxUSD) && maxUSD > 0) {
                    setMaxPriceUSD(maxUSD.toFixed(2));
                } else {
                    setMaxPriceUSD("");
                }
            }
        } else {
            setMinPriceUSD("");
            setMaxPriceUSD("");
        }
        
        setSelectedRating(searchParams.get("rating") || "");
        setSelectedDistrict(searchParams.get("district") || "");
        setOpenNow(searchParams.get("openNow") === "1");
        setDistanceRange(searchParams.get("distanceRange") || "");
    }, [searchParams]);

    const updateURL = (updates: Record<string, string | string[] | null>) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.delete("page");
        
        Object.entries(updates).forEach(([key, value]) => {
            currentParams.delete(key);
            if (value === null || (Array.isArray(value) && value.length === 0)) {
                // Already deleted
            } else if (Array.isArray(value)) {
                value.forEach((v) => currentParams.append(key, v));
            } else {
                currentParams.set(key, value);
            }
        });

        router.push(`/search?${currentParams.toString()}`, { scroll: false });
        if (onClose) onClose();
    };

    const handleCategoryToggle = (categoryName: string) => {
        const newCategories = selectedCategories.includes(categoryName)
            ? selectedCategories.filter((c) => c !== categoryName)
            : [...selectedCategories, categoryName];
        setSelectedCategories(newCategories);
    };

    const handleRatingChange = (value: string) => {
        const newValue = selectedRating === value ? "" : value;
        setSelectedRating(newValue);
    };

    const handleDistrictChange = (value: string) => {
        const newValue = selectedDistrict === value ? "" : value;
        setSelectedDistrict(newValue);
    };

    const handleOpenNowToggle = () => {
        setOpenNow((prev) => !prev);
    };

    const handleDistanceChange = (value: string) => {
        const next = distanceRange === value ? "" : value;
        setDistanceRange(next);
    };

    const handleClearAll = () => {
        setSelectedCategories([]);
        setMinPriceUSD("");
        setMaxPriceUSD("");
        setSelectedRating("");
        setSelectedDistrict("");
        setOpenNow(false);
        setDistanceRange("");
        // Clear all filters including search query
        router.push(`/search`, { scroll: false });
        if (onClose) onClose();
    };

    const hasActiveFilters =
        selectedCategories.length > 0 ||
        minPriceUSD ||
        maxPriceUSD ||
        selectedRating ||
        selectedDistrict ||
        openNow ||
        !!distanceRange;

    const activeFilterCount =
        selectedCategories.length +
        (minPriceUSD || maxPriceUSD ? 1 : 0) +
        (selectedRating ? 1 : 0) +
        (selectedDistrict ? 1 : 0) +
        (openNow ? 1 : 0) +
        (distanceRange ? 1 : 0);

    const handleApplyFilters = () => {
        const minUSD = parseFloat(minPriceUSD);
        const maxUSD = parseFloat(maxPriceUSD);

        let priceRangeValue: string | null = null;
        const hasMin = !isNaN(minUSD) && minUSD > 0;
        const hasMax = !isNaN(maxUSD) && maxUSD > 0;

        if (hasMin && hasMax && minUSD <= maxUSD) {
            priceRangeValue = `${minUSD}-${maxUSD}`;
        } else if (hasMin) {
            priceRangeValue = `${minUSD}+`;
        } else if (hasMax) {
            priceRangeValue = `0-${maxUSD}`;
        }

        updateURL({
            category: selectedCategories.length > 0 ? selectedCategories : null,
            priceRange: priceRangeValue,
            rating: selectedRating || null,
            district: selectedDistrict || null,
            openNow: openNow ? "1" : null,
            distanceRange: distanceRange || null,
        });
    };

    const content = (
        <div
            className={`${
                isMobile ? "p-4" : "p-4"
            } rounded-xl border shadow-sm ${
                theme === "dark" ? "border-white/12 bg-[#11172a]" : "border-gray-200 bg-white"
            } ${
                isMobile ? "" : "sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide"
            }`}
        >
            {/* Header */}
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white/95" : "text-gray-900"}`}>Filters</h3>
                    {activeFilterCount > 0 && (
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-orange/10 px-2 text-xs font-semibold text-brand-orange">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {isMobile ? (
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        aria-label="Close filters"
                        title="Close"
                    >
                        <X className={`w-5 h-5 ${theme === "dark" ? "text-white/70" : "text-gray-600"}`} />
                    </button>
                ) : (
                    hasActiveFilters && (
                        <Button
                            type="button"
                            onClick={handleClearAll}
                            variant="brandGhost"
                            size="sm"
                            className="h-8 px-2"
                        >
                            <X className="w-4 h-4" />
                            Clear All
                        </Button>
                    )
                )}
            </div>

            {/* Category Filter (pill chips) */}
            {searchType === "foods" && (
                <div className={`py-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                    <h5 className={`font-semibold text-sm mb-3 ${theme === "dark" ? "text-white/90" : "text-gray-900"}`}>Categories</h5>
                    {categories && categories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category: Category) => (
                                <button
                                    key={category.cateName}
                                    type="button"
                                    onClick={() => handleCategoryToggle(category.cateName)}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        selectedCategories.includes(category.cateName)
                                            ? "border-brand-orange/60 bg-brand-orange/15 text-brand-orange"
                                            : theme === "dark"
                                              ? "border-white/16 bg-white/6 text-white/80 hover:bg-white/10"
                                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
            )}

            {/* Price Range Filter */}
            {searchType === "foods" && (
                <FilterSection title="Price Range">
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                                <label className={`block text-xs font-medium ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>Min Price (VND)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={minPriceUSD}
                                    onChange={(e) => setMinPriceUSD(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={`block text-xs font-medium ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>Max Price (VND)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={maxPriceUSD}
                                    onChange={(e) => setMaxPriceUSD(e.target.value)}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        <p className={`text-xs mt-1 ${theme === "dark" ? "text-white/55" : "text-gray-500"}`}>Leave empty for no limit. Prices are shown in VND.</p>
                    </div>
                </FilterSection>
            )}

            {/* Rating Filter */}
            <FilterSection title="Rating">
                <div className="space-y-3">
                    {ratingOptions.map((option) => (
                        <label
                            key={option.value}
                            className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                                theme === "dark" ? "hover:bg-white/8" : "hover:bg-gray-50"
                            } ${
                                selectedRating === option.value ? "bg-brand-orange/10" : ""
                            }`}
                        >
                            <input
                                type="radio"
                                name="rating"
                                value={option.value}
                                checked={selectedRating === option.value}
                                onChange={() => handleRatingChange(option.value)}
                                className="w-4 h-4 text-brand-orange focus:ring-brand-orange"
                            />
                            <span className={`text-sm flex items-center gap-1 ${theme === "dark" ? "text-white/80" : "text-gray-700"}`}>
                                {option.value === "5" && "⭐⭐⭐⭐⭐"}
                                {option.value === "4" && "⭐⭐⭐⭐"}
                                {option.value === "3" && "⭐⭐⭐"}
                                <span className="ml-1">{option.label}</span>
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* District Filter */}
            <FilterSection title="Area">
                <Select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    aria-label="Select area"
                    className="w-full"
                >
                    <option value="">All Areas</option>
                    {districts.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </Select>
            </FilterSection>

            {searchType === "restaurants" && (
                <FilterSection title="Open Now">
                    <label className={`flex items-center gap-2 cursor-pointer p-2 rounded ${theme === "dark" ? "hover:bg-white/8" : "hover:bg-gray-50"}`}>
                        <input
                            type="checkbox"
                            checked={openNow}
                            onChange={handleOpenNowToggle}
                            className="w-4 h-4 text-brand-orange focus:ring-brand-orange rounded"
                        />
                        <span className={`text-sm ${theme === "dark" ? "text-white/80" : "text-gray-700"}`}>Show restaurants open right now</span>
                    </label>
                    <p className={`text-xs mt-2 ${theme === "dark" ? "text-white/55" : "text-gray-500"}`}>
                        UI-only if backend doesn&apos;t support hours yet.
                    </p>
                </FilterSection>
            )}

            {searchType === "restaurants" && (
                <FilterSection title="Distance">
                    <Select
                        value={distanceRange}
                        onChange={(e) => handleDistanceChange(e.target.value)}
                        aria-label="Select distance"
                        className="w-full"
                    >
                        {distanceOptions.map((opt) => (
                            <option key={opt.value || "any"} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </Select>
                    <p className={`text-xs mt-2 ${theme === "dark" ? "text-white/55" : "text-gray-500"}`}>
                        UI-only if backend doesn&apos;t support distance filtering yet.
                    </p>
                </FilterSection>
            )}

            {/* Apply / Clear actions */}
            <div className={`pt-4 mt-4 border-t ${theme === "dark" ? "border-white/10" : "border-gray-200"} flex gap-2`}>
                <Button
                    type="button"
                    onClick={handleClearAll}
                    variant="brandOutline"
                    className="flex-1 h-11 rounded-full"
                    disabled={!hasActiveFilters}
                >
                    Clear
                </Button>
                <Button
                    type="button"
                    onClick={handleApplyFilters}
                    variant="brand"
                    className="flex-1 h-11 rounded-full shadow-sm hover:shadow-md"
                >
                    Apply filters
                </Button>
            </div>

        </div>
    );

    if (isMobile) {
        // Mobile: show filters as a left sidebar drawer (like restaurants page)
        return (
            <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
                <div
                    className={`fixed top-0 left-0 h-full w-[85%] max-w-sm shadow-2xl overflow-y-auto ${
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

