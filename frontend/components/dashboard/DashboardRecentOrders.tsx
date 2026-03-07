import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import { formatCurrency } from "@/lib/utils/dashboardFormat";
import type { Order } from "@/types/order.type";

interface DashboardRecentOrdersProps {
    orders: Order[];
    loading: boolean;
}

export function DashboardRecentOrders({ orders, loading }: DashboardRecentOrdersProps) {
    return (
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex items-center justify-between">
                <h3 className="font-semibold text-black dark:text-white">Recent Orders</h3>
                <Link href="/admin/order" className="text-sm font-medium text-primary hover:underline">
                    View All
                </Link>
            </div>
            <div className="p-6">
                {loading ? (
                    <p className="text-sm text-bodydark">Loading...</p>
                ) : orders.length === 0 ? (
                    <p className="text-sm text-bodydark">No orders yet.</p>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => {
                            const statusColor =
                                order.status === "completed"
                                    ? "bg-meta-3/10 text-meta-3"
                                    : order.status === "cancelled"
                                      ? "bg-meta-1/10 text-meta-1"
                                      : "bg-warning/10 text-warning";
                            return (
                                <div
                                    key={order.orderId}
                                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray dark:hover:bg-meta-4 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ShoppingCart size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-black dark:text-white">
                                                #{order.orderId}
                                            </p>
                                            <p className="text-xs text-bodydark">
                                                {formatDateTime(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-black dark:text-white mb-1">
                                            {formatCurrency(order.finalAmount || 0)}
                                        </p>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
