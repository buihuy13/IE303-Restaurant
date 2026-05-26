import { getImageUrl } from "@/lib/utils";
import { getRestaurantDetailHref } from "@/lib/utils/restaurantNavigation";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
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
    const restaurantHref = getRestaurantDetailHref(restaurant) ?? "/search?type=restaurants";
    const hasPhone = typeof restaurant.phone === "string" && restaurant.phone.trim().length > 0;
    const { theme } = useClientTheme();
    const distanceMeters =
        typeof restaurant.distance === "number" && Number.isFinite(restaurant.distance) && restaurant.distance >= 0
            ? Math.round(restaurant.distance * 1000)
            : null;
    
    return (
        <Link
            href={restaurantHref}
            className={`group w-full overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-0.5 focus-within:ring-2 ${
                theme === "dark"
                    ? "surface-glass border-white/10 hover:border-white/20 hover:shadow-[0_20px_55px_rgba(2,6,25,0.45)] focus-within:ring-[color:var(--ring)]"
                    : "border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)] focus-within:ring-brand-orange/20"
            }`}
        >
            <div className="flex min-h-[168px] gap-4 p-4 sm:p-5">
                {/* Image */}
                <div
                    className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28 ${
                        theme === "dark" ? "bg-white/5 ring-1 ring-white/10" : "bg-gray-100 ring-1 ring-black/5"
                    }`}
                >
                    <Image
                        src={imageUrl}
                        alt={restaurant.resName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized={isPlaceholder}
                        sizes="(max-width: 640px) 96px, 112px"
                    />
                    {theme === "dark" && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3
                                className={`truncate text-base font-bold tracking-tight sm:text-lg ${
                                    theme === "dark" ? "text-white" : "text-gray-900"
                                }`}
                                title={restaurant.resName}
                            >
                                {restaurant.resName}
                            </h3>
                            {categoryName ? (
                                <div
                                    className={`mt-1 inline-flex max-w-full items-center truncate rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                                        theme === "dark"
                                            ? "border border-white/15 bg-white/10 text-white/90"
                                            : "bg-brand-orange/10 text-brand-orange"
                                    }`}
                                >
                                    {categoryName}
                                </div>
                            ) : null}
                        </div>

                        {restaurant.rating > 0 ? (
                            <div
                                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-semibold ${
                                    theme === "dark"
                                        ? "border border-white/15 bg-black/20 text-white/90"
                                        : "bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange/20"
                                }`}
                            >
                                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                <span>{restaurant.rating.toFixed(1)}</span>
                                <span className={theme === "dark" ? "text-white/65 font-semibold" : "text-gray-600 font-semibold opacity-80"}>
                                    ({restaurant.totalReview?.toLocaleString?.() ?? 0})
                                </span>
                            </div>
                        ) : null}
                    </div>

                    <p className={`mt-2 text-sm line-clamp-2 ${theme === "dark" ? "text-white/72" : "text-gray-600"}`}>
                        {restaurant.address}
                    </p>

                    <div className={`mt-3 flex flex-wrap items-center gap-2 text-[12px] ${theme === "dark" ? "text-white/70" : "text-gray-600"}`}>
                        {distanceMeters != null ? (
                            <span
                                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 ${
                                    theme === "dark" ? "border-white/15 bg-white/5" : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <MapPin className={`h-3.5 w-3.5 ${theme === "dark" ? "text-white/60" : "text-gray-500"}`} />
                                <span>{distanceMeters.toLocaleString()} m</span>
                            </span>
                        ) : null}

                        {restaurant.duration != null ? (
                            <span
                                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 ${
                                    theme === "dark" ? "border-white/15 bg-white/5" : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <Clock className={`h-3.5 w-3.5 ${theme === "dark" ? "text-white/60" : "text-gray-500"}`} />
                                <span>{restaurant.duration} min</span>
                            </span>
                        ) : null}

                        {restaurant.openingTime && restaurant.closingTime ? (
                            <span
                                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 ${
                                    theme === "dark" ? "border-white/15 bg-white/5" : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <Clock className={`h-3.5 w-3.5 ${theme === "dark" ? "text-white/60" : "text-gray-500"}`} />
                                <span className="font-semibold">
                                    {restaurant.openingTime} - {restaurant.closingTime}
                                </span>
                            </span>
                        ) : null}

                        {hasPhone ? (
                            <span
                                className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 ${
                                    theme === "dark" ? "border-white/15 bg-white/5" : "border-gray-200 bg-gray-50"
                                }`}
                            >
                                <Phone className={`h-3.5 w-3.5 ${theme === "dark" ? "text-white/60" : "text-gray-500"}`} />
                                <span className="font-semibold">{restaurant.phone}</span>
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                        <span className={`whitespace-nowrap text-xs font-semibold ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
                            {distanceMeters != null ? `${distanceMeters.toLocaleString()} m away` : "Distance unavailable"}
                        </span>

                        <span
                            className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100 ${
                                theme === "dark" ? "text-white" : "text-brand-orange"
                            }`}
                        >
                            View restaurant <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
