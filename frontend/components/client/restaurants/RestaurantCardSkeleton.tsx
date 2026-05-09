"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";

export const RestaurantCardSkeleton = () => {
        const { theme } = useClientTheme();
        const shimmer =
                theme === "dark"
                        ? "bg-gradient-to-r from-white/10 via-white/5 to-white/10 bg-[length:200%_100%] animate-shimmer"
                        : "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer";

        return (
        <div
                className={`rounded-2xl overflow-hidden h-full flex flex-col border shadow-sm ${
                        theme === "dark" ? "surface-glass border-white/10" : "bg-white border-gray-200"
                }`}
        >
                <div className="flex gap-4 p-4 sm:p-5 min-h-[160px]">
                        {/* Image skeleton */}
                        <div
                                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl ring-1 ${
                                        theme === "dark" ? "ring-white/10" : "ring-black/5"
                                } ${shimmer}`}
                        >
                                <div className={`absolute inset-0 ${theme === "dark" ? "bg-black/10" : "bg-transparent"}`} />
                        </div>

                        {/* Content skeleton */}
                        <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                                <div className={`h-6 rounded w-3/4 ${shimmer}`} />
                                                <div className={`mt-2 h-5 rounded w-40 ${shimmer}`} />
                                        </div>
                                        <div className={`h-9 rounded-full w-28 ${shimmer}`} />
                                </div>

                                <div className={`mt-2 h-4 rounded w-full ${shimmer}`} />
                                <div className={`mt-1 h-4 rounded w-5/6 ${shimmer}`} />

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <div className={`h-7 rounded-full w-24 ${shimmer}`} />
                                        <div className={`h-7 rounded-full w-20 ${shimmer}`} />
                                        <div className={`h-7 rounded-full w-32 ${shimmer}`} />
                                        <div className={`h-7 rounded-full w-24 ${shimmer}`} />
                                </div>

                                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                                        <div className={`h-4 rounded w-32 ${shimmer}`} />
                                        <div className={`h-4 rounded w-40 ${shimmer}`} />
                                </div>
                        </div>
                </div>
        </div>
        );
};
