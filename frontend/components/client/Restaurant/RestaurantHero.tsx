// File: app/_components/client/Restaurant/RestaurantHero.tsx
"use client";

import { getImageUrl } from "@/lib/utils";
import { Restaurant } from "@/types";
import { Clock, MapPin, Star } from "lucide-react";
import Image from "next/image";

export default function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
        const mainCategory = restaurant.cate[0]?.cateName || "Restaurant";
        const bannerUrl = restaurant.imageURL || "/placeholder-banner.png";

        return (
                <>
                        {/* 1. Hero Banner Wrapper - Atmospheric Blur Style */}
                        <div className="relative h-[330px] w-full overflow-hidden bg-gray-900 md:h-[440px]">
                                {/* Blurred Background Image */}
                                <Image
                                        src={getImageUrl(bannerUrl)}
                                        alt={`${restaurant.resName} background`}
                                        fill
                                        className="scale-110 object-cover opacity-70 blur-2xl"
                                        sizes="100vw"
                                        priority
                                        unoptimized={!restaurant.imageURL || restaurant.imageURL === "/placeholder-banner.png"}
                                />

                                {/* Strong Gradient Overlay */}
                                <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-900/95 via-gray-900/65 to-gray-900/20" />
                                <div className="absolute inset-0 z-0 bg-[radial-gradient(900px_circle_at_50%_30%,rgba(255,255,255,0.10),transparent_60%)]" />

                                {/* Content - Restaurant Info */}
                                <div className="absolute bottom-0 left-0 z-20 w-full p-6 md:p-8">
                                        <div className="custom-container flex items-end gap-4 md:gap-6">
                                                {/* Restaurant Logo/Avatar (Optional) */}
                                                <div className="hidden flex-shrink-0 md:block">
                                                        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white p-1 shadow-2xl ring-2 ring-white/20">
                                                                <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-100">
                                                                        <Image
                                                                                src={getImageUrl(restaurant.imageURL || "/placeholder.png")}
                                                                                alt={restaurant.resName}
                                                                                fill
                                                                                className="object-cover"
                                                                                unoptimized={!restaurant.imageURL || restaurant.imageURL === "/placeholder.png"}
                                                                        />
                                                                </div>
                                                        </div>
                                                </div>

                                                {/* Restaurant Info */}
                                                <div className="min-w-0 flex-1">
                                                        {/* Restaurant Name */}
                                                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)] md:text-5xl lg:text-6xl">
                                                                {restaurant.resName}
                                                        </h1>

                                                        {/* Category */}
                                                        <p className="mb-4 text-base text-gray-200 drop-shadow-md md:text-lg">
                                                                {mainCategory}
                                                        </p>

                                                        {/* Rating & Meta Info */}
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-6">
                                                                {/* Rating */}
                                                                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                                                                        <Star className="h-4 w-4 flex-shrink-0 fill-yellow-400 text-yellow-400" />
                                                                        <span className="font-semibold text-white">{restaurant.rating}</span>
                                                                        <span className="text-xs text-gray-200">
                                                                                ({restaurant.totalReview.toLocaleString()} reviews)
                                                                        </span>
                                                                </div>

                                                                {/* Duration & Distance */}
                                                                {restaurant.duration != null && restaurant.distance != null && (
                                                                        <>
                                                                                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-gray-200">
                                                                                        <Clock className="h-4 w-4 flex-shrink-0 text-gray-300" />
                                                                                        <span className="font-medium">{restaurant.duration} min</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-gray-200">
                                                                                        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-300" />
                                                                                        <span className="font-medium">{restaurant.distance.toFixed(1)} km</span>
                                                                                </div>
                                                                        </>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        {/* 2. Spacer for content below (to account for removed overlapping card) */}
                        <div className="h-8"></div>
                </>
        );
}
