import type { AxiosRequestConfig } from "axios";

/**
 * order-service is now routed through API gateway (`NEXT_PUBLIC_API_URL`),
 * so order/cart requests should reuse the default axios baseURL.
 */
export function withOrderServiceBase(config?: AxiosRequestConfig): AxiosRequestConfig {
    return config ?? {};
}
