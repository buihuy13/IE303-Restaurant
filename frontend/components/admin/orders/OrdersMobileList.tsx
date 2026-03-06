import { Edit, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Order, OrderStatus } from "@/types/order.type";

interface OrdersMobileListProps {
    orders: Order[];
    statusDraftById: Record<string, OrderStatus>;
    updatingIds: Set<string>;
    allowedNextStatuses: OrderStatus[];
    onStatusDraftChange: (orderId: string, status: OrderStatus) => void;
    onUpdateStatus: (orderId: string) => void;
    formatMoney: (amount: unknown) => string;
    shortId: (value: unknown, keep?: number) => string;
}

export function OrdersMobileList({
    orders,
    statusDraftById,
    updatingIds,
    allowedNextStatuses,
    onStatusDraftChange,
    onUpdateStatus,
    formatMoney,
    shortId,
}: OrdersMobileListProps) {
    if (orders.length === 0) {
        return (
            <div className="md:hidden space-y-3">
                <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">No orders found.</div>
            </div>
        );
    }

    return (
        <div className="md:hidden space-y-3">
            {orders.map((order) => (
                <div key={order.orderId} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-500">Order</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {shortId(order.orderId, 12)}
                            </p>
                        </div>
                        <span
                            className={`shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                            }`}
                        >
                            {order.status}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-500">Status</label>
                        {order.status === "cancelled" ? (
                            <div className="text-sm font-semibold text-red-600">cancelled</div>
                        ) : (
                            <select
                                value={statusDraftById[order.orderId] ?? order.status}
                                onChange={(e) => onStatusDraftChange(order.orderId, e.target.value as OrderStatus)}
                                disabled={updatingIds.has(order.orderId)}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-60"
                                aria-label="Update order status"
                                title="Update order status"
                            >
                                {allowedNextStatuses.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">User</span>
                            <span className="font-medium text-gray-900">{shortId(order.userId, 10)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">Restaurant</span>
                            <span className="font-medium text-gray-900 truncate max-w-[60%]">
                                {order.restaurant?.name || "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">Total</span>
                            <span className="font-semibold text-gray-900">{formatMoney(order.finalAmount)}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                            onClick={() => onUpdateStatus(order.orderId)}
                            disabled={updatingIds.has(order.orderId)}
                            className="h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            title="Update Status"
                        >
                            {updatingIds.has(order.orderId) ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Edit className="h-5 w-5" />
                            )}
                        </button>
                        <Link
                            href={`/admin/order/${order.orderId}`}
                            className="h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            title="View Details"
                        >
                            <Eye className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

