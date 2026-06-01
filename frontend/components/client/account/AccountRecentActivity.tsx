import Link from "next/link";
import type { RecentOrderDisplay } from "@/hooks/client/account/useAccountOrdersAndStats";

interface AccountRecentActivityProps {
    recentOrders: RecentOrderDisplay[];
}

export function AccountRecentActivity({ recentOrders }: AccountRecentActivityProps) {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">Recent Activity</h2>
            {recentOrders.length > 0 ? (
                <>
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="border border-gray-200 p-5 rounded-xl hover:border-brand-orange/30 transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                            >
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{order.displayId}</p>
                                    <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-lg text-gray-900">{order.total}</p>
                                    <span
                                        className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                                            order.statusClass ?? "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-right mt-6">
                        <Link
                            href="/account/orders"
                            className="text-sm font-bold text-brand-orange hover:text-brand-orange/80 transition-colors inline-flex items-center gap-1"
                        >
                            View all orders →
                        </Link>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Link
                        href="/search?type=restaurants"
                        className="text-sm font-bold text-brand-orange hover:text-brand-orange/80 transition-colors inline-flex items-center gap-1"
                    >
                        Start ordering →
                    </Link>
                </div>
            )}
        </div>
    );
}
