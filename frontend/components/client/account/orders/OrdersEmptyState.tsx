"use client";

import Link from "next/link";

export function OrdersEmptyState() {
    return (
        <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No orders found</p>
            <Link href="/restaurants" className="text-sm font-semibold text-[#EE4D2D] hover:underline">
                Browse Restaurants →
            </Link>
        </div>
    );
}
