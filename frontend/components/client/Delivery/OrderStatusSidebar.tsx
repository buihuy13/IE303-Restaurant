"use client";
import { orderApi } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Order, PaymentStatus } from "@/types/order.type";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
    order,
    onOrderUpdate,
}: {
    status: OrderStatus;
    orderId: string;
    canCancel: boolean;
    orderStatus?: string; // Order status from order object (e.g., "completed", "cancelled")
    order?: Order; // Full order object to access paymentStatus and finalAmount
    onOrderUpdate?: () => void; // Callback to refresh order data after payment
}) => {
    const { user } = useAuthStore();
    const isCancelled = status.restaurantStatus === "Cancel";
    const isCompleted = orderStatus?.toLowerCase() === "completed";
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const payosReturnHandledRef = useRef(false);

    const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
    
    // Check if payment is needed
    const paymentStatus = order?.paymentStatus?.toLowerCase() as PaymentStatus | undefined;
    // Only show payment section if paymentStatus exists and is explicitly "pending"
    // If paymentStatus is "paid", "completed", or "refunded", don't show payment form
    // If paymentStatus is undefined/null, don't show payment form (order might already be paid)
    const isPaid = paymentStatus === "paid" || paymentStatus === "completed" || paymentStatus === "refunded";
    const isUnpaid = paymentStatus === "pending";
    const needsPayment = isUnpaid && !isPaid; // Only show if explicitly pending and not paid
    const finalAmount = order?.finalAmount || 0;
    const formatPriceVND = (amount: number) => `${Math.round(amount).toLocaleString("vi-VN")} ₫`;

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

    // Handle payment initiation
    const handleInitiatePayment = async () => {
        if (!user?.id || !order) {
            toast.error("Please login to complete payment");
            return;
        }

        if (needsPayment === false) {
            toast.error("This order is already paid");
            return;
        }

        setIsProcessingCardPayment(true);
        const loadingToast = toast.loading("Preparing payment...");

        try {
            const calculatedTotal = finalAmount;
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const basePath = pathname || "";
            const returnUrl = `${origin}${basePath}?payos_return=success&orderId=${encodeURIComponent(order.orderId)}`;
            const cancelUrl = `${origin}${basePath}?payos_return=cancel`;

            sessionStorage.setItem(`payos_delivery_${order.orderId}`, "1");

            const res = await paymentApi.createPayment({
                orderId: order.orderId,
                userId: user.id,
                amount: calculatedTotal,
                paymentMethod: "card",
                returnUrl,
                cancelUrl,
            });

            if (!res.checkoutUrl) {
                throw new Error("Payment service did not return a checkout URL");
            }

            toast.dismiss(loadingToast);
            window.location.assign(res.checkoutUrl);
        } catch (error: unknown) {
            // Extract error message
            let errorMessage = "Unable to create payment. Please try again.";

            if (error && typeof error === "object") {
                const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
                if (errorObj.response?.data?.message) {
                    errorMessage = errorObj.response.data.message;
                } else if (errorObj.message) {
                    errorMessage = errorObj.message;
                }
            }

            toast.dismiss(loadingToast);
            toast.error(errorMessage, { duration: 5000 });
            setIsProcessingCardPayment(false);
        }
    };

    const handlePaymentSuccess = useCallback(async () => {
        setIsPaymentSuccess(true);
        setIsProcessingCardPayment(false);

        toast.success("Payment successful! Your order has been paid.", {
            duration: 3000,
        });

        if (onOrderUpdate) {
            onOrderUpdate();
        } else {
            router.refresh();
        }
    }, [onOrderUpdate, router]);

    useEffect(() => {
        if (payosReturnHandledRef.current) return;
        const ret = searchParams.get("payos_return");
        if (!ret) return;

        if (ret === "cancel") {
            payosReturnHandledRef.current = true;
            toast.error("Payment cancelled");
            setIsProcessingCardPayment(false);
            router.replace(pathname);
            return;
        }

        if (ret === "success") {
            payosReturnHandledRef.current = true;
            sessionStorage.removeItem(`payos_delivery_${orderId}`);
            setIsProcessingCardPayment(false);
            void handlePaymentSuccess();
            router.replace(pathname);
        }
    }, [searchParams, pathname, router, orderId, handlePaymentSuccess]);

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

            {/* Payment Section - Show if payment is needed */}
            {needsPayment && !isCancelled && !isPaymentSuccess && (
                <div className="border border-gray-200 rounded-2xl bg-white p-6 mt-6 shadow-sm" data-payment-form>
                    <h3 className="text-lg font-bold tracking-tight mb-4 text-gray-900">Complete Payment</h3>
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="text-2xl font-bold text-brand-orange">
                                {formatPriceVND(finalAmount)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Please complete payment to proceed with your order.
                        </p>
                    </div>
                    
                    {isProcessingCardPayment ? (
                        <div className="text-center text-sm text-gray-600 py-2">
                            <div className="inline-flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-orange" />
                                Redirecting to PayOS…
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleInitiatePayment}
                            disabled={isProcessingCardPayment}
                            className={`w-full font-bold py-3 rounded-full transition-colors shadow-sm hover:shadow-md ${
                                isProcessingCardPayment
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-brand-orange text-white hover:bg-brand-orange/90"
                            }`}
                        >
                            Pay Now
                        </button>
                    )}
                </div>
            )}

            {!isCancelled && !isCompleted ? (
                <>
                    <div className="border border-gray-200 rounded-2xl bg-white p-6 mt-6 text-center shadow-sm">
                        <p className="text-gray-600 mb-2">Your Order Will Come In</p>
                        {status.estimatedTime > 0 ? (
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
