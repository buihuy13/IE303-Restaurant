"use client";

import { useCategoryStore } from "@/stores/categoryStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function HeroSearchSection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { categories, fetchAllCategories } = useCategoryStore();
    const activeCategory = searchParams.get("category") || "";
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAllCategories();
    }, [fetchAllCategories]);

    const handleCategoryClick = (categoryName: string) => {
        const params = new URLSearchParams();
        
        // Set category filter for search page
        params.set("category", categoryName);
        
        // Redirect to search page with category filter
        router.push(`/search?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            router.push("/?type=foods");
            return;
        }

        // Redirect to search page
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    };

    // Popular categories for quick access
    const customCategories = [
        { name: "Com", displayName: "Rice" },
        { name: "Bubble Tea", displayName: "Bubble Tea" },
        { name: "Vegetarian", displayName: "Vegetarian" },
    ];

    // Merge categories and remove duplicates based on name
    const categoryMap = new Map<string, { name: string; displayName: string }>();
    
    // Add custom categories first
    customCategories.forEach((cat) => {
        categoryMap.set(cat.name.toLowerCase(), cat);
    });
    
    // Add categories from store, skipping duplicates
    categories?.slice(0, 6).forEach((cat) => {
        const key = cat.cateName.toLowerCase();
        if (!categoryMap.has(key)) {
            categoryMap.set(key, { name: cat.cateName, displayName: cat.cateName });
        }
    });
    
    const allCategories = Array.from(categoryMap.values());

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-4 md:px-8 lg:px-12">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80')]"
                />
                {/* Premium overlay stack: vignette + radial lift + bottom gradient */}
                <div className="absolute inset-0 bg-black/65 w-full h-full" />
                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_30%,rgba(87,42,248,0.22),transparent_58%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_18%_18%,rgba(41,176,103,0.14),transparent_60%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/20" />
            </div>

            {/* Content - Centered */}
            <div className="relative z-10 container mx-auto px-4 text-center text-white">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
                    Order food now,
                    <br />
                    <span className="text-brand-orange drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]">super fast delivery</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Over 1000+ delicious dishes, order in just 1 minute
                </p>

                {/* Search Bar - Wider and More Prominent */}
                <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
                    <div className="relative surface-glass rounded-full p-1.5">
                        <Input
                            type="text"
                            placeholder="Search for beef noodle soup, bubble tea, fried chicken..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "h-14 w-full py-4 pl-14 pr-32 rounded-full text-white placeholder:text-white/55 text-base",
                                "bg-black/25 border border-white/10",
                                "focus-visible:ring-[color:var(--ring)] focus-visible:border-white/20",
                            )}
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                        <Button
                            type="submit"
                            variant="brand"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6 py-2 shadow-lg hover:shadow-xl btn-primary"
                        >
                            Search
                        </Button>
                    </div>
                </form>

                {/* Category Tags */}
                <div className="mt-8">
                    <p className="text-white/80 text-sm mb-4 font-medium">Popular Categories:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {/* All Category */}
                        <Button
                            type="button"
                            onClick={() => {
                                // Redirect to search page without category filter
                                router.push(`/search`);
                            }}
                            variant={!activeCategory ? "brand" : "secondary"}
                            className={cn(
                                "rounded-full shadow-sm transition-all",
                                !activeCategory ? "shadow-lg btn-primary" : "chip-glass",
                            )}
                        >
                            <span>All</span>
                        </Button>

                        {/* Popular Categories */}
                        {allCategories.map((cat) => {
                            const categoryName = cat.name;
                            const displayName = cat.displayName;
                            const isActive = activeCategory === categoryName;

                            return (
                                <Button
                                    key={categoryName}
                                    onClick={() => handleCategoryClick(categoryName)}
                                    type="button"
                                    variant={isActive ? "brand" : "secondary"}
                                    className={cn(
                                        "rounded-full shadow-sm transition-all",
                                        isActive ? "shadow-lg btn-primary" : "chip-glass",
                                    )}
                                >
                                    <span>{displayName}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
