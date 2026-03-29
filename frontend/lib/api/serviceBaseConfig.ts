import type { AxiosRequestConfig } from "axios";
import { API_URL, ORDER_API_URL, PAYMENT_API_URL } from "../config/publicRuntime";

/** Merge config for order-service when `NEXT_PUBLIC_ORDER_API_URL` differs from the main API URL. */
export function withOrderServiceBase(config?: AxiosRequestConfig): AxiosRequestConfig {
    if (ORDER_API_URL === API_URL) {
        return config ?? {};
    }
    return { ...config, baseURL: ORDER_API_URL };
}

/** Merge config for payment-service when `NEXT_PUBLIC_PAYMENT_API_URL` differs from the main API URL. */
export function withPaymentServiceBase(config?: AxiosRequestConfig): AxiosRequestConfig {
    if (PAYMENT_API_URL === API_URL) {
        return config ?? {};
    }
    return { ...config, baseURL: PAYMENT_API_URL };
}
