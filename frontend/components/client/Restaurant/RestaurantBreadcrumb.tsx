"use client";

import { Restaurant } from "@/types";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function RestaurantBreadcrumb({ restaurant }: { restaurant: Restaurant }) {
        return (
                <nav className="flex flex-wrap items-center gap-2 py-4">
                        <Link
                                href="/"
                                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm ring-1 ring-gray-200 hover:text-brand-orange hover:ring-brand-orange/30 transition-colors"
                        >
                                <Home className="w-4 h-4" />
                                <span className="text-sm font-medium">Home</span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <Link
                                href="/restaurants"
                                className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-gray-700 shadow-sm ring-1 ring-gray-200 hover:text-brand-orange hover:ring-brand-orange/30 transition-colors text-sm font-medium"
                        >
                                Restaurants
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-white text-sm font-semibold truncate max-w-[320px]">
                                {restaurant.resName}
                        </span>
                </nav>
        );
}
