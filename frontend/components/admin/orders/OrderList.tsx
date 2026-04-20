"use client";

import { useAdminOrderSearch } from "@/hooks/admin/orders/useAdminOrderSearch";
import { useAdminOrderStatusDraft } from "@/hooks/admin/orders/useAdminOrderStatusDraft";
import { useAdminOrderActions } from "@/hooks/admin/orders/useAdminOrderActions";
import { OrdersSearchBar } from "@/components/admin/orders/OrdersSearchBar";
import { OrdersMobileList } from "@/components/admin/orders/OrdersMobileList";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { Order, OrderStatus } from "@/types/order.type";

export default function OrderList({ initialOrders }: { initialOrders: Order[] }) {
    const { orders, setOrders, statusDraftById, setStatusDraftById, updatingIds, setUpdatingIds } =
        useAdminOrderStatusDraft(initialOrders);
    const { searchTerm, setSearchTerm, filteredOrders } = useAdminOrderSearch(orders);

    const allowedNextStatuses: OrderStatus[] = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERING,
        OrderStatus.COMPLETED,
    ];

    const { handleUpdateStatus } = useAdminOrderActions(
        orders,
        (updater) => setOrders(updater),
        statusDraftById,
        (updater) => setStatusDraftById(updater),
        updatingIds,
        (updater) => setUpdatingIds(updater),
    );

    const formatMoney = (amount: unknown) => {
        const n = typeof amount === "number" ? amount : Number(amount);
        return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
    };

    const shortId = (value: unknown, keep: number = 8) => {
        const s = String(value ?? "");
        if (!s) return "—";
        return s.length > keep ? `${s.slice(0, keep)}…` : s;
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <OrdersSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <OrdersMobileList
                orders={filteredOrders}
                statusDraftById={statusDraftById}
                updatingIds={updatingIds}
                allowedNextStatuses={allowedNextStatuses}
                onStatusDraftChange={(orderId, status) =>
                    setStatusDraftById((prev) => ({
                        ...prev,
                        [orderId]: status,
                    }))
                }
                onUpdateStatus={handleUpdateStatus}
                formatMoney={formatMoney}
                shortId={shortId}
            />
            <OrdersTable
                orders={filteredOrders}
                statusDraftById={statusDraftById}
                updatingIds={updatingIds}
                allowedNextStatuses={allowedNextStatuses}
                onStatusDraftChange={(orderId, status) =>
                    setStatusDraftById((prev) => ({
                        ...prev,
                        [orderId]: status,
                    }))
                }
                onUpdateStatus={handleUpdateStatus}
                formatMoney={formatMoney}
                shortId={shortId}
            />
        </div>
    );
}
