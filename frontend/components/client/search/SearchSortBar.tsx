"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";

const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "distance", label: "Nearest" },
    { value: "rating", label: "Top Rated" },
];

export default function SearchSortBar({ searchType = "foods" }: { searchType?: "foods" | "restaurants" }) {
    const { theme } = useClientTheme();
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
            ? sortOptions.filter((o) => o.value === "relevance" || o.value === "rating")
            : sortOptions;

    return (
        <div className={`flex-1 rounded-xl border p-2.5 ${theme === "dark" ? "bg-white/6 border-white/12" : "bg-gray-50 border-gray-200/80"}`}>
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${theme === "dark" ? "text-white/78" : "text-gray-700"}`}>Sort by:</span>
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
                                : theme === "dark"
                                  ? "bg-white/10 text-white/90 hover:bg-white/16 border border-white/14"
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

