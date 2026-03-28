import type { CreatePaymentRequest, PayOSPaymentLinkResponse } from "@/types/payment.type";
import api from "../axios";
import { APP_ORIGIN } from "../config/publicRuntime";
import { withPaymentServiceBase } from "./serviceBaseConfig";

/**
 * Maps UI checkout totals to PayOS integer amount (VND).
 * `payment-service` uses the same integer as PayOS (`CreatePaymentLinkRequest.amount`).
 */
export function toPayOSAmountVnd(total: number): number {
    const n = Number(total);
    if (!Number.isFinite(n) || n <= 0) {
        return 1000;
    }
    return Math.max(1000, Math.round(n));
}

function defaultPaymentOrigin(): string {
    if (typeof window !== "undefined" && window.location?.origin) {
        return window.location.origin;
    }
    return APP_ORIGIN || "http://localhost:3000";
}

export const paymentApi = {
    /**
     * Creates a PayOS payment link (`PaymentController#POST /api/payments/create`).
     * Response: `{ checkoutUrl, orderCode, paymentLinkId }` — redirect the browser to `checkoutUrl`.
     */
    createPayment: async (paymentData: CreatePaymentRequest): Promise<PayOSPaymentLinkResponse> => {
        const origin = defaultPaymentOrigin();
        const returnUrl = paymentData.returnUrl ?? `${origin}/payment?payos_return=success`;
        const cancelUrl = paymentData.cancelUrl ?? `${origin}/payment?payos_return=cancel`;
        const description =
            paymentData.description?.trim() ||
            (paymentData.orderId ? `Thanh toan don hang ${paymentData.orderId}` : "Thanh toan don hang");

        const payload = {
            userId: paymentData.userId,
            amount: toPayOSAmountVnd(paymentData.amount),
            description,
            cancelUrl,
            returnUrl,
        };

        const response = await api.post<PayOSPaymentLinkResponse>("/payments/create", payload, withPaymentServiceBase());
        return response.data;
    },
};
