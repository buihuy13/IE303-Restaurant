"use client";

import { useRouter } from "next/navigation";

interface SearchEmptyStateProps {
    query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
    const router = useRouter();

    const handleReset = () => {
        router.push("/search", { scroll: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="text-center py-20 bg-white rounded-lg">
            <div className="flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-500 text-sm max-w-md mb-6">
                    {query
                        ? `No food items found for "${query}". Try searching with different keywords.`
                        : "No food items match your filters."}
                </p>
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 bg-[#EE4D2D] text-white rounded-lg font-semibold hover:bg-[#EE4D2D]/90 transition-colors"
                >
                    Reset All
                </button>
            </div>
        </div>
    );
}
