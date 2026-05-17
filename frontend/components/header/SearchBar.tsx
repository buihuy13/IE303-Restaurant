"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { productApi } from "@/lib/api/productApi";
import { restaurantApi } from "@/lib/api/restaurantApi";
import { Product, Restaurant } from "@/types";
import { Search, Store, Utensils } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

interface SearchSuggestion {
    type: "restaurant" | "product";
    id: string;
    name: string;
    slug?: string;
    image?: string | null;
    restaurantName?: string;
    restaurantSlug?: string;
}

export default function SearchBar() {
    const { theme } = useClientTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Sync input with URL query when viewing /search (but don't override while user is typing)
    useEffect(() => {
        if (pathname !== "/search") return;
        if (isFocused) return;

        const q = searchParams.get("q") || "";
        setSearchQuery(q);
    }, [pathname, searchParams, isFocused]);

    // Debounced search for suggestions
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const trimmedQuery = searchQuery.trim();

        // Don't search if query is too short or empty
        if (trimmedQuery.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Set loading state
        setIsLoadingSuggestions(true);

        // Debounce: wait 300ms after user stops typing
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                // Fetch both restaurants and products in parallel
                const [restaurantsRes, productsRes] = await Promise.all([
                    restaurantApi.getAllRestaurants(
                        new URLSearchParams({
                            search: trimmedQuery,
                            page: "0",
                            size: "5",
                            lat: "10.9032198",
                            lon: "106.7750317",
                        }),
                    ),
                    productApi.getAllProducts(
                        new URLSearchParams({
                            search: trimmedQuery,
                            page: "0",
                            size: "5",
                            lat: "10.9032198",
                            lon: "106.7750317",
                        }),
                        "relevance",
                    ),
                ]);

                const restaurantSuggestions: SearchSuggestion[] = (restaurantsRes.data?.content || []).map(
                    (r: Restaurant) => ({
                        type: "restaurant" as const,
                        id: r.id,
                        name: r.resName,
                        slug: r.slug,
                        image: typeof r.imageURL === "string" ? r.imageURL : null,
                    }),
                );

                const productSuggestions: SearchSuggestion[] = (productsRes.data?.content || []).map((p: Product) => ({
                    type: "product" as const,
                    id: p.id,
                    name: p.productName,
                    slug: p.slug,
                    image: typeof p.imageURL === "string" ? p.imageURL : null,
                    restaurantName: p.restaurant?.resName,
                    restaurantSlug: p.restaurant?.slug,
                }));

                // Combine and limit to 8 total suggestions (4 restaurants + 4 products)
                const combined = [...restaurantSuggestions.slice(0, 4), ...productSuggestions.slice(0, 4)];
                setSuggestions(combined);
                setShowSuggestions(combined.length > 0 && isFocused);
            } catch (error) {
                console.error("Failed to fetch search suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 300);

        // Cleanup timeout on unmount or query change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, isFocused]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        if (showSuggestions) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSuggestions]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();

        // Trim whitespace
        const trimmedQuery = searchQuery.trim();
        const currentType = (searchParams.get("type") || "foods") as "foods" | "restaurants";

        // If query is empty, redirect to home page (preserve current type)
        if (!trimmedQuery) {
            router.push(`/?type=${currentType}`);
            return;
        }

        // Redirect to search page, preserving current mode/type when possible
        // (prevents "jumping" between Foods/Restaurants while searching from header)
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set("type", currentType);
        params.set("q", trimmedQuery);
        params.delete("page");
        if (pathname !== "/search") {
            params.delete("sort");
        }
        router.push(`/search?${params.toString()}`);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        if (suggestion.type === "restaurant" && suggestion.slug) {
            router.push(`/restaurants/${suggestion.slug}`);
        } else if (suggestion.type === "product") {
            // Flow mong muốn: từ search → vào nhà hàng → trong nhà hàng mới vào food detail
            if (suggestion.restaurantSlug) {
                router.push(`/restaurants/${suggestion.restaurantSlug}`);
            } else if (suggestion.slug) {
                // Fallback an toàn nếu thiếu restaurantSlug
                router.push(`/food/${suggestion.slug}`);
            }
        }
        setShowSuggestions(false);
        setSearchQuery("");
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleInputBlur = () => {
        // Delay to allow click on suggestions
        setTimeout(() => {
            setIsFocused(false);
            setShowSuggestions(false);
        }, 200);
    };

    return (
        <div className="hidden lg:flex flex-1 max-w-2xl relative" ref={suggestionsRef}>
            <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full">
                    <Input
                        type="text"
                        placeholder="Search for food, drinks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className={`h-11 w-full py-2.5 px-4 pl-11 rounded-full text-sm border transition-all duration-200 ${
                            theme === "dark"
                                ? isFocused
                                    ? "bg-white/12 text-white placeholder:text-white/50 border-brand-orange/50 shadow-lg ring-2 ring-brand-orange/20"
                                    : "bg-white/8 text-white/95 placeholder:text-white/45 border-white/12 hover:bg-white/10 hover:border-white/20"
                                : isFocused
                                  ? "bg-white border-brand-orange/40 shadow-lg ring-2 ring-brand-orange/15 text-gray-900 placeholder:text-gray-500"
                                  : "bg-gray-50 border-gray-200/60 hover:bg-white hover:border-gray-200 text-gray-900 placeholder:text-gray-500"
                        }`}
                    />
                    <Search
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                            theme === "dark" ? "text-white/55" : "text-gray-400"
                        }`}
                    />
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                <div
                    className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl max-h-[420px] overflow-y-auto z-50 overflow-hidden border ${
                        theme === "dark" ? "bg-[#12182b] border-white/12" : "bg-white border-gray-200/80"
                    }`}
                >
                    {isLoadingSuggestions ? (
                        <div className={`p-4 text-center ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
                            <div className="animate-pulse">Searching...</div>
                        </div>
                    ) : (
                        <>
                            {suggestions.filter((s) => s.type === "restaurant").length > 0 && (
                                <div className="p-2">
                                    <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-white/55" : "text-gray-500"}`}>
                                        Restaurants
                                    </div>
                                    {suggestions
                                        .filter((s) => s.type === "restaurant")
                                        .map((suggestion) => (
                                            <button
                                                key={`restaurant-${suggestion.id}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                                    theme === "dark" ? "hover:bg-white/8" : "hover:bg-gray-50"
                                                }`}
                                            >
                                                <Store className="w-4 h-4 text-brand-orange flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-medium text-sm truncate ${theme === "dark" ? "text-white/95" : "text-gray-900"}`}>
                                                        {suggestion.name}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            )}

                            {suggestions.filter((s) => s.type === "product").length > 0 && (
                                <div className={`p-2 border-t ${theme === "dark" ? "border-white/10" : "border-gray-100"}`}>
                                    <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-white/55" : "text-gray-500"}`}>
                                        Dishes
                                    </div>
                                    {suggestions
                                        .filter((s) => s.type === "product")
                                        .map((suggestion) => (
                                            <button
                                                key={`product-${suggestion.id}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                                                    theme === "dark" ? "hover:bg-white/8" : "hover:bg-gray-50"
                                                }`}
                                            >
                                                <Utensils className="w-4 h-4 text-brand-orange flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-medium text-sm truncate ${theme === "dark" ? "text-white/95" : "text-gray-900"}`}>
                                                        {suggestion.name}
                                                    </div>
                                                    {suggestion.restaurantName && (
                                                        <div className={`text-xs truncate ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
                                                            {suggestion.restaurantName}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            )}

                            {/* View All Results */}
                            {searchQuery.trim().length >= 2 && (
                                <div className={`p-2 border-t ${theme === "dark" ? "border-white/10" : "border-gray-100"}`}>
                                    <Button
                                        onClick={handleSearch}
                                        variant="ghost"
                                        className={`w-full justify-center text-sm font-semibold text-brand-orange rounded-xl ${
                                            theme === "dark" ? "hover:bg-brand-orange/15" : "hover:bg-brand-orange/10"
                                        }`}
                                    >
                                        View all results for &quot;{searchQuery}&quot;
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
