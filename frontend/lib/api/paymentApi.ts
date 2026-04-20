import type { CreatePaymentRequest, PayOSPaymentLinkResponse } from "@/types/payment.type";
import api from "../axios";
import { APP_ORIGIN } from "../config/publicRuntime";

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** PayOS API rejects `description` longer than 25 characters. */
const PAYOS_DESCRIPTION_MAX_LEN = 25;

function truncatePayOSDescription(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length <= PAYOS_DESCRIPTION_MAX_LEN) {
        return trimmed;
    }
    return trimmed.slice(0, PAYOS_DESCRIPTION_MAX_LEN);
}

function unwrapPaymentCreateBody(body: unknown): PayOSPaymentLinkResponse {
    if (!body || typeof body !== "object") {
        return body as PayOSPaymentLinkResponse;
    }
    const rec = body as Record<string, unknown>;
    if (rec.data && typeof rec.data === "object") {
        return rec.data as PayOSPaymentLinkResponse;
    }
    return body as PayOSPaymentLinkResponse;
}

export const paymentApi = {
    /**
     * Creates a PayOS payment link (`PaymentController#POST /api/payments/create`).
     * Response: `{ checkoutUrl, orderCode, paymentLinkId }` — redirect the browser to `checkoutUrl`.
     */
    createPayment: async (paymentData: CreatePaymentRequest): Promise<PayOSPaymentLinkResponse> => {
        const orderId = String(paymentData.orderId ?? "").trim();
        const userId = String(paymentData.userId ?? "").trim();
        if (!orderId || !UUID_REGEX.test(orderId)) {
            throw new Error("Missing or invalid order id for payment. Please place the order again.");
        }
        if (!userId || !UUID_REGEX.test(userId)) {
            throw new Error("Missing or invalid user id for payment. Please sign in again.");
        }

        const origin = defaultPaymentOrigin();
        const returnUrl = paymentData.returnUrl ?? `${origin}/payment?payos_return=success`;
        const cancelUrl = paymentData.cancelUrl ?? `${origin}/payment?payos_return=cancel`;
        // Default stays under PayOS limit; do not append full UUID (would exceed 25 chars).
        const rawDescription =
            paymentData.description?.trim() || "Thanh toan don hang";
        const description = truncatePayOSDescription(rawDescription);

        const payload = {
            orderId,
            userId,
            amount: toPayOSAmountVnd(paymentData.amount),
            description,
            cancelUrl,
            returnUrl,
        };

        const response = await api.post<unknown>("/payments/create", payload);
        return unwrapPaymentCreateBody(response.data);
    },
};
