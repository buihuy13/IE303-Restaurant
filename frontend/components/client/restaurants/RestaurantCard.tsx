import { getImageUrl } from "@/lib/utils";
import { Restaurant } from "@/types";
import { ArrowRight, Clock, MapPin, Phone, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type RestaurantCardProps = {
    restaurant: Restaurant;
};

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
    const imageUrl = getImageUrl(restaurant.imageURL);
    const isPlaceholder = imageUrl === "/placeholder.png" || !restaurant.imageURL;
    const categoryName = Array.isArray(restaurant.cate) ? restaurant.cate[0]?.cateName : null;
    const hasPhone = typeof restaurant.phone === "string" && restaurant.phone.trim().length > 0;
    
    return (
        <Link
            href={`/restaurants/${restaurant.slug}`}
            className="group w-full overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)] focus-within:ring-2 focus-within:ring-brand-orange/20"
        >
            <div className="flex min-h-[168px] gap-4 p-4 sm:p-5">
                {/* Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-black/5 sm:h-28 sm:w-28">
                    <Image
                        src={imageUrl}
                        alt={restaurant.resName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized={isPlaceholder}
                        sizes="(max-width: 640px) 96px, 112px"
                    />
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-bold tracking-tight text-gray-900 sm:text-lg" title={restaurant.resName}>
                                {restaurant.resName}
                            </h3>
                            {categoryName ? (
                                <div className="mt-1 inline-flex max-w-full items-center truncate rounded-full bg-brand-orange/10 px-2.5 py-1 text-[12px] font-semibold text-brand-orange">
                                    {categoryName}
                                </div>
                            ) : null}
                        </div>

                        {restaurant.rating > 0 ? (
                            <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-brand-orange/10 px-3 py-1 text-[12px] font-semibold text-brand-orange ring-1 ring-brand-orange/20">
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                <span>{restaurant.rating.toFixed(1)}</span>
                                <span className="text-gray-600 font-semibold opacity-80">
                                    ({restaurant.totalReview?.toLocaleString?.() ?? 0})
                                </span>
                            </div>
                        ) : null}
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{restaurant.address}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-gray-600">
                        {restaurant.distance != null ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                <span>{restaurant.distance.toFixed(1)} km</span>
                            </span>
                        ) : null}

                        {restaurant.duration != null ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                                <Clock className="h-3.5 w-3.5 text-gray-500" />
                                <span>{restaurant.duration} min</span>
                            </span>
                        ) : null}

                        {restaurant.openingTime && restaurant.closingTime ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                                <Clock className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-semibold">
                                    {restaurant.openingTime} - {restaurant.closingTime}
                                </span>
                            </span>
                        ) : null}

                        {hasPhone ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-1">
                                <Phone className="h-3.5 w-3.5 text-gray-500" />
                                <span className="font-semibold">{restaurant.phone}</span>
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                        <span className="whitespace-nowrap text-xs font-semibold text-gray-500">
                            {restaurant.distance != null ? `${restaurant.distance.toFixed(1)} km away` : "Distance unavailable"}
                        </span>

                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-brand-orange opacity-0 transition-opacity group-hover:opacity-100">
                            View restaurant <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
