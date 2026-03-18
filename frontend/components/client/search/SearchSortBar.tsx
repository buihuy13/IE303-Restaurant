"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "distance", label: "Nearest" },
    { value: "popular", label: "Top Sales" },
    { value: "rating", label: "Top Rated" },
];

export default function SearchSortBar({ searchType = "foods" }: { searchType?: "foods" | "restaurants" }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "relevance";

    const handleSortChange = (value: string) => {
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        if (value === "relevance") {
            currentParams.delete("sort");
        } else {
            currentParams.set("sort", value);
        }
        router.push(`/search?${currentParams.toString()}`, { scroll: false });
    };

    const optionsToUse =
        searchType === "restaurants"
            ? sortOptions.filter((o) => o.value !== "popular") // restaurants: no "Top Sales"
            : sortOptions;

    return (
        <div className="bg-gray-50 rounded-xl border border-gray-200/80 p-3 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                {optionsToUse.map((option) => (
                    <Button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        type="button"
                        variant={currentSort === option.value ? "brand" : "secondary"}
                        size="sm"
                        className={
                            currentSort === option.value
                                ? "shadow-sm"
                                : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200/70"
                        }
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}

