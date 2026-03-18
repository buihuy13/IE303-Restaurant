// File: app/restaurants/_components/RestaurantsContainer.tsx
"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
import FilterSidebar from "./FilterSidebar";
import RestaurantList from "./RestaurantList";

export default function RestaurantsContainer() {
        const [isFilterOpen, setIsFilterOpen] = useState(false);

        return (
                <>
                        {/* Mobile Filter Button */}
                        <div className="lg:hidden p-4 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur-xl z-10">
                                <button
                                        onClick={() => setIsFilterOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                                >
                                        <Filter className="w-4 h-4" />
                                        <span>Filters</span>
                                </button>
                        </div>

                        <div className="custom-container grid grid-cols-1 lg:grid-cols-12 gap-x-10 py-8 sm:py-10 md:py-12">
                                {/* --- Sidebar cho Desktop --- */}
                                <div className="hidden lg:block lg:col-span-4">
                                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                                <FilterSidebar />
                                        </div>
                                </div>

                                {/* --- Drawer/Modal cho Mobile --- */}
                                {isFilterOpen && (
                                        <div
                                                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                                                onClick={() => setIsFilterOpen(false)}
                                        >
                                                <div
                                                        className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 p-6 overflow-y-auto shadow-2xl"
                                                        onClick={(e) => e.stopPropagation()}
                                                >
                                                        <div className="flex justify-end mb-4">
                                                                <button
                                                                        title="Close"
                                                                        onClick={() => setIsFilterOpen(false)}
                                                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                                >
                                                                        <X className="w-6 h-6" />
                                                                </button>
                                                        </div>
                                                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                                                <FilterSidebar />
                                                        </div>
                                                </div>
                                        </div>
                                )}

                                {/* --- Restaurant list --- */}
                                <div className="col-span-1 lg:col-span-8">
                                        <RestaurantList />
                                </div>
                        </div>
                </>
        );
}
