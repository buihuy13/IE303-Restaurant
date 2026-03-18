export const FoodCardSkeleton = () => (
        <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-full flex flex-col">
                {/* Image skeleton with shimmer effect */}
                <div className="relative w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer">
                        <div className="absolute bottom-2 right-2 w-16 h-6 bg-gray-300/50 rounded-full"></div>
                </div>

                {/* Content skeleton */}
                <div className="p-4 flex-grow flex flex-col space-y-3">
                        {/* Product name with shimmer */}
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-3/4"></div>

                        {/* Restaurant name with shimmer */}
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-1/2"></div>

                        {/* Rating and price */}
                        <div className="flex items-center justify-between mt-auto pt-3">
                                <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-8"></div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
                                </div>
                                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
                        </div>
                </div>

                {/* Footer skeleton */}
                <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between gap-2">
                                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
                                <div className="h-10 w-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                        </div>
                </div>
        </div>
);
