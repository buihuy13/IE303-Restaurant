"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";

export const FoodCardSkeleton = () => {
        const { theme } = useClientTheme();
        const shimmer =
                theme === "dark"
                        ? "bg-gradient-to-r from-white/10 via-white/5 to-white/10 bg-[length:200%_100%] animate-shimmer"
                        : "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer";

        return (
        <div
                className={`group relative rounded-3xl overflow-hidden border shadow-sm h-full flex flex-col ${
                        theme === "dark" ? "bg-[#111427] border-white/10" : "bg-white border-gray-200"
                }`}
        >
                {/* Image skeleton with shimmer effect */}
                <div className={`relative w-full aspect-[3/2] ${theme === "dark" ? "bg-[#1b2140]" : ""}`}>
                        <div className={`absolute inset-0 ${shimmer}`}></div>
                        <div className={`absolute bottom-2.5 left-2.5 w-20 h-5 rounded-full ${shimmer}`}></div>
                </div>

                {/* Content skeleton */}
                <div className={`p-4 flex-grow flex flex-col ${theme === "dark" ? "bg-[#0f172a]" : ""}`}>
                        {/* Product name with shimmer */}
                        <div className={`h-4 rounded w-3/4 ${shimmer}`}></div>
                        <div className={`h-4 rounded w-2/3 mt-1 ${shimmer}`}></div>

                        {/* Restaurant name with shimmer */}
                        <div className="mt-2 flex items-center gap-2">
                                <div className={`h-3 rounded w-1/2 ${shimmer}`}></div>
                                <div className={`h-3 w-3 rounded-full ${shimmer}`}></div>
                        </div>

                        {/* Rating and price */}
                        <div className="flex items-center justify-between mt-3 min-h-[20px]">
                                <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded ${shimmer}`}></div>
                                        <div className={`h-3 rounded w-7 ${shimmer}`}></div>
                                        <div className={`h-3 rounded w-12 ${shimmer}`}></div>
                                </div>
                                <div className={`h-3 rounded w-8 ${shimmer}`}></div>
                        </div>

                        {/* Footer skeleton (price + add row) */}
                        <div className={`mt-3 pt-3 border-t ${theme === "dark" ? "border-white/10" : "border-gray-100"}`}>
                                <div className="flex items-center justify-between gap-3">
                                        <div className={`h-5 rounded w-20 ${shimmer}`}></div>
                                        <div className={`h-9 rounded-full w-20 ${shimmer}`}></div>
                                </div>
                        </div>
                </div>
        </div>
        );
};
