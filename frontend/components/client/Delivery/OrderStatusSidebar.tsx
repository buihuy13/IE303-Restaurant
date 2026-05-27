"use client";
import { orderApi } from "@/lib/api/orderApi";
import type { Order } from "@/types/order.type";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { StatusBadge } from "./StatusBadge";

type StatusType = "Pending" | "Success" | "Cancel";
type OrderStatus = {
    orderValidate: StatusType;
    orderReceived: StatusType;
    restaurantStatus: StatusType;
    deliveryStatus: StatusType;
    estimatedTime: number;
};

export const OrderStatusSidebar = ({
    status,
    orderId,
    canCancel,
    orderStatus,
    etaLoading,
}: {
    status: OrderStatus;
    orderId: string;
    canCancel: boolean;
    orderStatus?: string; // Order status from order object (e.g., "completed", "cancelled")
    /** True while resolving ETA from query-service (no server `estimatedDeliveryTime` yet). */
    etaLoading?: boolean;
    order?: Order; // Full order object to access paymentStatus and finalAmount
    onOrderUpdate?: () => void; // Callback to refresh order data after payment
}) => {
    const isCancelled = status.restaurantStatus === "Cancel";
    const isCompleted = orderStatus?.toLowerCase() === "completed";
    const router = useRouter();

    const handleCancel = async () => {
        if (!canCancel || isCancelled) return;
        const reason = window.prompt("Why are you cancelling this order?", "Changed my mind");
        if (!reason || !reason.trim()) {
            toast.error("Cancellation reason is required");
            return;
        }
        try {
            await orderApi.cancelOrder(orderId, reason.trim());
            toast.success("Order cancelled");
            router.refresh();
        } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error("Could not cancel order");
        }
    };

    return (
        <div className="w-full lg:sticky lg:top-24">
            <div className="border border-gray-200 rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold tracking-tight mb-4 text-gray-900">Order Status</h2>
                <div className="space-y-3 text-gray-600">
                    <div className="flex justify-between items-center">
                        <span>Order Validate</span>
                        <StatusBadge status={status.orderValidate} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Order Received</span>
                        <StatusBadge status={status.orderReceived} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Restaurant Status</span>
                        <StatusBadge status={status.restaurantStatus} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Delivery Status</span>
                        <StatusBadge status={status.deliveryStatus} />
                    </div>
                </div>
            </div>

            {!isCancelled && !isCompleted ? (
                <>
                    <div className="border border-gray-200 rounded-2xl bg-white p-6 mt-6 text-center shadow-sm">
                        <p className="text-gray-600 mb-2">Your Order Will Come In</p>
                        {status.estimatedTime > 0 && !etaLoading ? (
                            <p className="text-4xl font-bold my-2 text-brand-orange">
                                {status.estimatedTime} {status.estimatedTime === 1 ? "Minute" : "Minutes"}
                            </p>
                        ) : (
                            <p className="text-lg font-semibold my-2 text-gray-500">Calculating...</p>
                        )}
                    </div>
                    <button
                        disabled={!canCancel || isCancelled}
                        onClick={handleCancel}
                        className={`w-full mt-6 font-bold py-3 rounded-full transition-colors shadow-sm hover:shadow-md ${
                            !canCancel || isCancelled
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-yellow-400 text-black hover:bg-yellow-500"
                        }`}
                    >
                        {isCancelled ? "Cancelled Order" : "Cancel Order"}
                    </button>
                </>
            ) : isCompleted ? (
                <>
                    <div className="border border-gray-200 rounded-2xl bg-white p-6 mt-6 text-center shadow-sm">
                        <p className="text-green-600 text-2xl font-bold">Order Completed!</p>
                        <p className="text-gray-600 mt-2">Thank you for your order</p>
                    </div>
                    <button
                        onClick={() => router.push("/orders", { scroll: false })}
                        className="w-full mt-6 font-bold py-3 rounded-full transition-colors bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm hover:shadow-md"
                    >
                        Back to Order List
                    </button>
                </>
            ) : (
                <>
                    <div className="rounded-lg mt-6 text-center">
                        <p className="text-red-600 text-2xl  rounded-md font-bold line-through ">
                            Your Order Was Cancelled
                        </p>
                    </div>
                    <button
                        className="cursor-pointer w-full mt-6 font-bold py-3 rounded-full transition-colors bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm hover:shadow-md"
                        onClick={() => router.push("/orders", { scroll: false })}
                    >
                        Back to Order List
                    </button>
                </>
            )}
        </div>
    );
};
