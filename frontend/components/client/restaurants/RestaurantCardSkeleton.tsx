export const RestaurantCardSkeleton = () => (
        <div className="rounded-2xl overflow-hidden bg-white h-full flex flex-col border border-gray-200 shadow-sm">
                <div className="flex gap-4 p-4 sm:p-5 min-h-[160px]">
                        {/* Image skeleton */}
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer ring-1 ring-black/5">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200/60 via-gray-100/40 to-gray-200/60" />
                        </div>

                        {/* Content skeleton */}
                        <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4" />
                                                <div className="mt-2 h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40" />
                                        </div>
                                        <div className="h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-28" />
                                </div>

                                <div className="mt-2 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-full" />
                                <div className="mt-1 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-5/6" />

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-24" />
                                        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-20" />
                                        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-32" />
                                        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full w-24" />
                                </div>

                                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-32" />
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-40" />
                                </div>
                        </div>
                </div>
        </div>
);
