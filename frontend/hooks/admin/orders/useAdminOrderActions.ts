import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { orderApi } from "@/lib/api/orderApi";
import type { Order, OrderStatus } from "@/types/order.type";
import { useRouter } from "next/navigation";

export function useAdminOrderActions(
    orders: Order[],
    setOrders: (updater: (prev: Order[]) => Order[]) => void,
    statusDraftById: Record<string, OrderStatus>,
    setStatusDraftById: (updater: (prev: Record<string, OrderStatus>) => Record<string, OrderStatus>) => void,
    updatingIds: Set<string>,
    setUpdatingIds: (updater: (prev: Set<string>) => Set<string>) => void,
) {
    const router = useRouter();
    const confirmAction = useConfirm();

    const handleUpdateStatus = async (orderId: string) => {
        const current = orders.find((o) => o.orderId === orderId);
        if (!current) return;

        const nextStatus = statusDraftById[orderId] ?? current.status;
        if (nextStatus === current.status) {
            toast.error("No status change to apply.");
            return;
        }

        const ok = await confirmAction({
            title: "Update order status?",
            description: `Change order ${String(orderId).slice(0, 10)}… from “${current.status}” to “${nextStatus}”?`,
            confirmText: "Update",
            cancelText: "Cancel",
        });
        if (!ok) {
            setStatusDraftById((prev) => ({ ...prev, [orderId]: current.status }));
            return;
        }

        setUpdatingIds((prev) => new Set(prev).add(orderId));
        const prevStatus = current.status;
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: nextStatus } : o)));
        try {
            await orderApi.updateAdminOrderStatus(orderId, nextStatus);
            toast.success("Order status updated.");
            router.refresh();
        } catch (error) {
            console.error("Failed to update order status:", error);
            setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: prevStatus } : o)));
            setStatusDraftById((prev) => ({ ...prev, [orderId]: prevStatus }));
            toast.error("Unable to update order status.");
        } finally {
            setUpdatingIds((prev) => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    };

    return {
        handleUpdateStatus,
    };
}

