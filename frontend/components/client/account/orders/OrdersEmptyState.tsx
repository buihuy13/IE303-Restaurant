"use client";

import Link from "next/link";

export function OrdersEmptyState() {
    return (
        <div className="text-center py-12">
            <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-8">
                <div className="text-5xl mb-3">🧾</div>
                <p className="text-gray-800 text-lg font-semibold mb-1">No orders found</p>
                <p className="text-gray-600 text-sm mb-5">
                    Once you place an order, you’ll be able to track it here.
                </p>
                <Link href="/search?type=restaurants" className="text-sm font-semibold text-brand-orange hover:underline">
                    Browse Restaurants →
                </Link>
            </div>
        </div>
    );
}
