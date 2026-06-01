"use client";

import { Restaurant } from "@/types";
import ChatWithRestaurantButton from "./ChatWithRestaurantButton";

interface RestaurantActionsProps {
    restaurant: Restaurant;
}

export default function RestaurantActions({ restaurant }: RestaurantActionsProps) {
    const distanceMeters =
        typeof restaurant.distance === "number" && Number.isFinite(restaurant.distance) && restaurant.distance >= 0
            ? Math.round(restaurant.distance)
            : null;

    return (
        <div className="rounded-2xl border-0 bg-transparent p-0 shadow-none">
            <h2 className="text-xl font-bold tracking-tight mb-4 text-gray-900">Quick Actions</h2>

            {restaurant.openingTime && restaurant.closingTime && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Opening Hours</h3>
                    <p className="text-sm text-gray-600">
                        {restaurant.openingTime} - {restaurant.closingTime}
                    </p>
                </div>
            )}

            {distanceMeters != null && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Distance</h3>
                    <p className="text-sm text-gray-600">{distanceMeters.toLocaleString()} m away</p>
                </div>
            )}

            {restaurant.duration > 0 && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Thời gian giao (ước tính)</h3>
                    <p className="text-sm text-gray-600">{restaurant.duration} phút</p>
                </div>
            )}

            <ChatWithRestaurantButton
                merchantId={restaurant.merchantId}
                restaurantName={restaurant.resName}
                variant="outline"
                className="w-full h-11 rounded-full"
            />
        </div>
    );
}
