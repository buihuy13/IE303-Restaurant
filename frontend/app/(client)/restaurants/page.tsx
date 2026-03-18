"use client";

import RestaurantsContainer from "@/components/client/restaurants/RestaurantsContainer";

export default function RestaurantsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
            <div className="custom-container py-8 sm:py-10 md:py-12">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Explore</h1>
                    <p className="text-sm text-gray-600 mt-1">Find restaurants or food items near you.</p>
                </div>
            </div>
            <RestaurantsContainer />
        </main>
    );
}

