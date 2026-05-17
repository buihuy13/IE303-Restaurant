"use client";

import { Button } from "@/components/ui/Button";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Input } from "@/components/ui/Input";
import { useCategoryStore } from "@/stores/categoryStore";
import { Category } from "@/types";
import { Check, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import FilterSection from "./FilterSection";

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
    const [minPriceVnd, setMinPriceVnd] = useState<string>("");
    const [maxPriceVnd, setMaxPriceVnd] = useState<string>("");
    const [nearbyMeters, setNearbyMeters] = useState<string>("");

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
                    setMinPriceVnd(String(Math.round(min)));
                    setMaxPriceVnd("");
                }
            } else {
                const [minStr, maxStr] = priceRange.split("-");
                const min = minStr ? parseFloat(minStr) : null;
                const max = maxStr ? parseFloat(maxStr) : null;
                setMinPriceVnd(min !== null && !isNaN(min) && min > 0 ? String(Math.round(min)) : "");
                setMaxPriceVnd(max !== null && !isNaN(max) && max > 0 ? String(Math.round(max)) : "");
            }
        } else {
            setMinPriceVnd("");
            setMaxPriceVnd("");
        }

        setNearbyMeters(searchParams.get("nearby") || "");
    }, [searchParams]);

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
        setMinPriceVnd("");
        setMaxPriceVnd("");
        setNearbyMeters("");
        const type = searchParams.get("type");
        router.push(type ? `/search?type=${type}` : "/search", { scroll: false });
        if (onClose) onClose();
    };

    const hasActiveFilters =
        (searchType === "foods" && selectedCategories.length > 0) ||
        (searchType === "foods" && !!(minPriceVnd || maxPriceVnd)) ||
        !!nearbyMeters;

    const activeFilterCount =
        (searchType === "foods" ? selectedCategories.length : 0) +
        (searchType === "foods" && (minPriceVnd || maxPriceVnd) ? 1 : 0) +
        (nearbyMeters ? 1 : 0);

    const handleApplyFilters = () => {
        const updates: Record<string, string | string[] | null> = {
            nearby: nearbyMeters.trim() ? nearbyMeters.trim() : null,
        };

        if (searchType === "foods") {
            updates.category = selectedCategories.length > 0 ? selectedCategories : null;

            const min = parseFloat(minPriceVnd);
            const max = parseFloat(maxPriceVnd);
            let priceRangeValue: string | null = null;
            const hasMin = !isNaN(min) && min > 0;
            const hasMax = !isNaN(max) && max > 0;

            if (hasMin && hasMax && min <= max) {
                priceRangeValue = `${Math.round(min)}-${Math.round(max)}`;
            } else if (hasMin) {
                priceRangeValue = `${Math.round(min)}+`;
            } else if (hasMax) {
                priceRangeValue = `0-${Math.round(max)}`;
            }
            updates.priceRange = priceRangeValue;
        }

        updateURL(updates);
    };

    const panelClass = `p-4 rounded-xl border shadow-sm ${
        theme === "dark" ? "border-white/12 bg-[#11172a]" : "border-gray-200 bg-white"
    } ${isMobile ? "" : "sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide"}`;

    const content = (
        <div className={panelClass}>
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

            <FilterSection title="Radius (meters)">
                <Input
                    type="number"
                    min={1}
                    max={20000}
                    placeholder="e.g. 5000"
                    value={nearbyMeters}
                    onChange={(e) => setNearbyMeters(e.target.value)}
                    className="h-10"
                />
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
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>Min (VND)</label>
                                <Input type="number" min={0} value={minPriceVnd} onChange={(e) => setMinPriceVnd(e.target.value)} className="h-10" />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1 ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>Max (VND)</label>
                                <Input type="number" min={0} value={maxPriceVnd} onChange={(e) => setMaxPriceVnd(e.target.value)} className="h-10" />
                            </div>
                        </div>
                    </FilterSection>
                </>
            )}

            {searchType === "restaurants" && (
                <p className={`text-sm ${theme === "dark" ? "text-white/65" : "text-gray-600"}`}>
                    Restaurant filters: `search`, `nearby`, sort `rating=desc` via sort bar only.
                </p>
            )}

            <div className={`pt-4 mt-4 border-t ${theme === "dark" ? "border-white/10" : "border-gray-200"} flex gap-2`}>
                <Button type="button" onClick={handleClearAll} variant="brandOutline" className="flex-1 h-11 rounded-full" disabled={!hasActiveFilters}>
                    Clear
                </Button>
                <Button type="button" onClick={handleApplyFilters} variant="brand" className="flex-1 h-11 rounded-full">
                    Apply filters
                </Button>
            </div>
        </div>
    );

    if (isMobile) {
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