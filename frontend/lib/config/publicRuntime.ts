type PublicEnvValue = string | undefined;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getEnv = (value: PublicEnvValue): string | undefined => {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    return undefined;
};

const DEFAULT_API_URL = "http://localhost:8443/api";
const DEFAULT_APP_ORIGIN = "http://localhost:3000";
const DEFAULT_KEYCLOAK_BASE_URL = "http://localhost:8443/auth";
const DEFAULT_KEYCLOAK_REALM = "restaurant-realm";
const DEFAULT_KEYCLOAK_CLIENT_ID = "restaurant-frontend";

/**
 * Base URL for REST API calls.
 * Expected format: http(s)://host:port/api
 */
export const API_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_API_URL) ?? DEFAULT_API_URL,
);

/**
 * Public site origin for PayOS return/cancel URLs (e.g. `http://localhost:3000`). Optional if you only build URLs in the browser.
 */
export const APP_ORIGIN = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_APP_URL) ?? DEFAULT_APP_ORIGIN,
);

const BACKEND_ORIGIN = trimTrailingSlash(API_URL.replace(/\/+api\/?$/, ""));

/**
 * SockJS/STOMP base URL (HTTP origin).
 * Expected format: http(s)://host:port
 */
export const WS_BASE_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_WS_BASE_URL) ?? BACKEND_ORIGIN,
);

/**
 * SockJS/STOMP base URL for the order WebSocket service.
 */
export const ORDER_WS_BASE_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_ORDER_WS_BASE_URL) ?? BACKEND_ORIGIN,
);

/**
 * Dedicated origin for notification-service SSE endpoint.
 * Use this when SSE is exposed on a different host/port than API gateway.
 */
export const NOTIFICATION_SSE_ORIGIN = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_NOTIFICATION_SSE_ORIGIN) ?? BACKEND_ORIGIN,
);

/**
 * Keycloak OpenID Connect settings (frontend public client).
 */
export const KEYCLOAK_BASE_URL = trimTrailingSlash(
    getEnv(process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL) ?? DEFAULT_KEYCLOAK_BASE_URL,
);

export const KEYCLOAK_REALM = getEnv(process.env.NEXT_PUBLIC_KEYCLOAK_REALM) ?? DEFAULT_KEYCLOAK_REALM;

export const KEYCLOAK_CLIENT_ID = getEnv(process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID) ?? DEFAULT_KEYCLOAK_CLIENT_ID;

/**
 * Convert an http(s) base URL to ws(s).
 */
export const toWebSocketOrigin = (httpOrigin: string) => httpOrigin.replace(/^http/i, "ws");
