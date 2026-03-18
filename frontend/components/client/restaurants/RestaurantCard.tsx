import { getImageUrl } from "@/lib/utils";
import { Restaurant } from "@/types";
import { Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type RestaurantCardProps = {
    restaurant: Restaurant;
};

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
    const imageUrl = getImageUrl(restaurant.imageURL);
    const isPlaceholder = imageUrl === "/placeholder.png" || !restaurant.imageURL;
    
    return (
    <Link
        href={`/restaurants/${restaurant.slug}`}
        className="group rounded-2xl overflow-hidden bg-white h-full flex flex-col border border-gray-200 shadow-sm hover:shadow-md transition-[transform,shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-orange/20"
    >
        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
            <Image
                src={imageUrl}
                alt={restaurant.resName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                unoptimized={isPlaceholder}
            />

            {/* Meta pills */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {restaurant.rating > 0 && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-sm ring-1 ring-white/60">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            <span>{restaurant.rating.toFixed(1)}</span>
                            <span className="text-gray-500">({restaurant.totalReview.toLocaleString()})</span>
                        </div>
                    )}
                    {restaurant.distance != null && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-sm ring-1 ring-white/60">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            <span>{restaurant.distance.toFixed(1)} km</span>
                        </div>
                    )}
                </div>
                {restaurant.duration != null && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-sm ring-1 ring-white/60 flex-shrink-0">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <span>{restaurant.duration} min</span>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 flex-grow flex flex-col">
            <h3 className="font-bold text-lg tracking-tight truncate text-gray-900" title={restaurant.resName}>
                {restaurant.resName}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{restaurant.address}</p>

            <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-500">
                    {restaurant.distance != null ? `${restaurant.distance.toFixed(1)} km away` : "Distance unavailable"}
                </span>
                <span className="text-xs font-semibold text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity">
                    View details →
                </span>
            </div>
        </div>
    </Link>
    );
};
