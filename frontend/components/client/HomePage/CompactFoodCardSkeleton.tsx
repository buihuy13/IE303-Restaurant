"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";

export const CompactFoodCardSkeleton = () => {
    const { theme } = useClientTheme();
    const shimmer =
        theme === "dark"
            ? "bg-gradient-to-r from-white/10 via-white/5 to-white/10 bg-[length:200%_100%] animate-shimmer"
            : "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer";

    return (
    <div
        className={`rounded-xl overflow-hidden border shadow-sm ${
            theme === "dark" ? "surface-glass border-white/10" : "bg-white border-gray-100"
        }`}
    >
        {/* Image skeleton with shimmer effect */}
        <div className={`relative w-full aspect-[3/2] rounded-t-xl ${shimmer}`} />

        {/* Content skeleton */}
        <div className="p-4 space-y-2">
            {/* Product name */}
            <div className={`h-4 rounded w-3/4 ${shimmer}`} />

            {/* Restaurant name with icon */}
            <div className="flex items-center gap-1.5">
                <div className={`h-3 rounded flex-1 ${shimmer}`} />
                <div className={`h-3 w-3 rounded-full ${shimmer}`} />
            </div>

            {/* Rating */}
            <div className={`h-3 rounded w-24 ${shimmer}`} />

            {/* Price */}
            <div className={`h-4 rounded w-20 pt-1 ${shimmer}`} />
        </div>
    </div>
    );
};

