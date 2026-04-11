import { Edit, Loader2 } from "lucide-react";
import type { Order, OrderStatus } from "@/types/order.type";

interface OrdersTableProps {
    orders: Order[];
    statusDraftById: Record<string, OrderStatus>;
    updatingIds: Set<string>;
    allowedNextStatuses: OrderStatus[];
    onStatusDraftChange: (orderId: string, status: OrderStatus) => void;
    onUpdateStatus: (orderId: string) => void;
    formatMoney: (amount: unknown) => string;
    shortId: (value: unknown, keep?: number) => string;
}

export function OrdersTable({
    orders,
    statusDraftById,
    updatingIds,
    allowedNextStatuses,
    onStatusDraftChange,
    onUpdateStatus,
    formatMoney,
    shortId,
}: OrdersTableProps) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.orderId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {shortId(order.orderId, 12)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {shortId(order.userId, 10)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.restaurant?.name || "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatMoney(order.finalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {order.status === "cancelled" ? (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                        cancelled
                                    </span>
                                ) : (
                                    <select
                                        value={statusDraftById[order.orderId] ?? order.status}
                                        onChange={(e) => onStatusDraftChange(order.orderId, e.target.value as OrderStatus)}
                                        disabled={updatingIds.has(order.orderId)}
                                        className="h-10 rounded-lg border border-gray-200 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-60"
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
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="inline-flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onUpdateStatus(order.orderId)}
                                        disabled={updatingIds.has(order.orderId)}
                                        className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50"
                                        title="Update Status"
                                    >
                                        {updatingIds.has(order.orderId) ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Edit className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

