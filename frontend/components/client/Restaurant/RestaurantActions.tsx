"use client";

import { Restaurant } from "@/types";
import ChatWithRestaurantButton from "./ChatWithRestaurantButton";

interface RestaurantActionsProps {
    restaurant: Restaurant;
}

export default function RestaurantActions({ restaurant }: RestaurantActionsProps) {
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

            {restaurant.distance != null && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Distance</h3>
                    <p className="text-sm text-gray-600">{restaurant.distance.toFixed(1)} km away</p>
                </div>
            )}

            {restaurant.duration != null && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery Time</h3>
                    <p className="text-sm text-gray-600">{restaurant.duration} minutes</p>
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
