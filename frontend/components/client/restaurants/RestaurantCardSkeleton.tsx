export const RestaurantCardSkeleton = () => (
        <div className="rounded-2xl overflow-hidden bg-white h-full flex flex-col border border-gray-200 shadow-sm">
                {/* Image skeleton with shimmer effect */}
                <div className="relative w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer">
                        <div className="absolute bottom-3 left-3 h-6 w-40 bg-gray-300/50 rounded-full"></div>
                        <div className="absolute bottom-3 right-3 h-6 w-20 bg-gray-300/50 rounded-full"></div>
                </div>

                {/* Content skeleton */}
                <div className="p-4 flex-grow flex flex-col space-y-3">
                        {/* Title with shimmer */}
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>

                        {/* Address with shimmer */}
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-5/6"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-2/3"></div>

                        {/* Rating and view details */}
                        <div className="flex items-center justify-between mt-auto pt-3">
                                <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-8"></div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
                                </div>
                                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
                        </div>
                </div>
        </div>
);
