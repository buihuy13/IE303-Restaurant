"use client";

import type { AccountOrderDisplay } from "@/hooks/client/account/useAccountOrdersList";
import { Truck } from "lucide-react";
import Link from "next/link";

export function OrderListItem(props: { order: AccountOrderDisplay }) {
    const { order } = props;

    return (
        <div className="border border-gray-200 bg-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1">
                <p className="font-bold text-lg tracking-tight text-gray-900">{order.displayId}</p>
                <p className="text-sm text-gray-500">{order.date}</p>
                <p className="font-semibold text-brand-purple mt-1">{order.total}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <span className={`text-sm font-semibold ${order.statusClass}`}>{order.status}</span>
                {order.status && !order.status.toLowerCase().includes("cancelled") && (
                    <Link
                        href={`/delivery/${order.slug || order.orderCode || order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-800 rounded-full text-xs font-semibold hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
                    >
                        <Truck className="w-3 h-3" />
                        Track Order
                    </Link>
                )}
                <Link
                    href={`/orders/${order.slug || order.orderCode || order.id}`}
                    className="text-sm font-semibold text-brand-orange hover:underline"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
