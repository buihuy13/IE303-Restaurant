"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
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
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <div className="flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 text-sm max-w-md mb-6">
                    {query
                        ? `No food items found for "${query}". Try searching with different keywords.`
                        : "No food items match your filters."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="button" onClick={handleReset} variant="brand" className="h-12 px-6">
                        Reset All
                    </Button>
                    <Button asChild variant="brandOutline" className="h-12 px-6">
                        <Link href="/restaurants">Browse restaurants</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
