type PublicEnvValue = string | undefined;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getEnv = (value: PublicEnvValue): string | undefined => {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    return undefined;
};

/**
 * Canonical public envs (khuyến nghị dùng):
 * - NEXT_PUBLIC_API_URL (bắt buộc /api)
 * - NEXT_PUBLIC_BACKEND_ORIGIN (origin, không /api)
 * - NEXT_PUBLIC_WS_BASE_URL
 * - NEXT_PUBLIC_ORDER_SOCKET_URL
 * - NEXT_PUBLIC_ORDER_WS_BASE_URL
 *
 * Các biến alias vẫn được hỗ trợ như fallback (NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_API_ORIGIN)
 * để không phá vỡ cấu hình cũ, nhưng nên bỏ dần để giảm trùng lặp.
 */
const pickEnv = (preferred: PublicEnvValue[], aliases: PublicEnvValue[], fallback: string) => {
    for (const candidate of preferred) {
        const v = getEnv(candidate);
        if (v) return v;
    }
    for (const candidate of aliases) {
        const v = getEnv(candidate);
        if (v) return v;
    }
    return fallback;
};

/**
 * Base URL for REST API calls.
 * Expected format: http(s)://host:port/api
 */
export const API_URL = trimTrailingSlash(
    pickEnv([process.env.NEXT_PUBLIC_API_URL], [process.env.NEXT_PUBLIC_API_BASE_URL], "http://localhost:8080/api"),
);

/**
 * Base URL for order-service (cart + orders). Defaults to {@link API_URL}.
 * Set when order-service is exposed on another host until the API gateway routes `/api/orders` and `/api/cart`.
 */
export const ORDER_API_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_ORDER_API_URL) ?? API_URL,
);

/**
 * Public site origin for PayOS return/cancel URLs (e.g. `http://localhost:3000`). Optional if you only build URLs in the browser.
 */
export const APP_ORIGIN = trimTrailingSlash(
    pickEnv([process.env.NEXT_PUBLIC_APP_URL], [], ""),
);

/**
 * Origin for backend/gateway (no trailing slash).
 * Used for SSE and OAuth2 redirect targets.
 *
 * If not explicitly provided, it is derived from API_URL by stripping a trailing "/api".
 */
export const BACKEND_ORIGIN = trimTrailingSlash(
    pickEnv(
        [process.env.NEXT_PUBLIC_BACKEND_ORIGIN],
        [process.env.NEXT_PUBLIC_API_ORIGIN],
        API_URL.replace(/\/+api\/?$/, ""),
    ),
);

/**
 * SockJS/STOMP base URL (HTTP origin).
 * Expected format: http(s)://host:port
 */
export const WS_BASE_URL = trimTrailingSlash(
    pickEnv([process.env.NEXT_PUBLIC_WS_BASE_URL], [], BACKEND_ORIGIN || "http://localhost:8080"),
);

/**
 * socket.io base URL for order notifications.
 */
export const ORDER_SOCKET_URL = trimTrailingSlash(
    // Nếu không cấu hình riêng, mặc định dùng chung BACKEND_ORIGIN
    pickEnv([process.env.NEXT_PUBLIC_ORDER_SOCKET_URL], [], BACKEND_ORIGIN),
);

/**
 * SockJS/STOMP base URL for the order WebSocket service.
 */
export const ORDER_WS_BASE_URL = trimTrailingSlash(
    // Nếu không cấu hình riêng, ưu tiên:
    // 1) NEXT_PUBLIC_ORDER_WS_BASE_URL
    // 2) NEXT_PUBLIC_ORDER_SOCKET_URL
    // 3) ORDER_SOCKET_URL (thường là BACKEND_ORIGIN)
    pickEnv(
        [process.env.NEXT_PUBLIC_ORDER_WS_BASE_URL],
        [process.env.NEXT_PUBLIC_ORDER_SOCKET_URL],
        ORDER_SOCKET_URL,
    ),
);

/**
 * Dedicated origin for notification-service SSE endpoint.
 * Use this when SSE is exposed on a different host/port than API gateway.
 */
export const NOTIFICATION_SSE_ORIGIN = trimTrailingSlash(
    pickEnv([process.env.NEXT_PUBLIC_NOTIFICATION_SSE_ORIGIN], [], BACKEND_ORIGIN),
);

/**
 * Keycloak OpenID Connect settings (frontend public client).
 */
export const KEYCLOAK_BASE_URL = trimTrailingSlash(
    pickEnv([process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL], [], "http://localhost:9090/auth"),
);

export const KEYCLOAK_REALM = pickEnv([process.env.NEXT_PUBLIC_KEYCLOAK_REALM], [], "restaurant-realm");

export const KEYCLOAK_CLIENT_ID = pickEnv([process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID], [], "restaurant-frontend");

/**
 * Convert an http(s) base URL to ws(s).
 */
export const toWebSocketOrigin = (httpOrigin: string) => httpOrigin.replace(/^http/i, "ws");
