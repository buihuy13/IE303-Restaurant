import { useAuthStore } from "@/stores/useAuthStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authApi } from "./api/authApi";
import { API_URL } from "./config/publicRuntime";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/**
 * Runtime API base URL selection:
 * - Client-side (browser): use NEXT_PUBLIC_API_URL (API_URL)
 * - Server-side (Next.js SSR inside Docker): use API_INTERNAL_URL if provided (e.g. http://api-gateway:8080/api)
 */
const getRuntimeApiUrl = () => {
    // SSR / server-side
    if (typeof window === "undefined") {
        const internal = process.env.API_INTERNAL_URL;
        if (typeof internal === "string" && internal.trim()) {
            return trimTrailingSlash(internal.trim());
        }
    }
    // Browser (or fallback)
    
    return API_URL;
};

/** Use on each order/cart request so the URL always matches current env (avoids stale baseURL from module init). */
export function getApiBaseUrl(): string {
    return getRuntimeApiUrl();
}

// Create Axios instance
const api = axios.create({
    baseURL: getRuntimeApiUrl(),
    timeout: 30000,
    // Required so the browser sends/receives refresh-token cookies from the API gateway.
    withCredentials: true,
    // Do not auto-follow redirects (prevents redirects to Docker hostnames)
    maxRedirects: 0,
    // Throw for 4xx/5xx so auth refresh + callers can handle properly.
    // Keep redirects (3xx) as non-throw since maxRedirects=0 is used to prevent following Docker hostname redirects.
    validateStatus: (status) => status < 400,
});

const normalizeToken = (value: string | null): string | null => {
    if (!value) return null;
    const v = value.trim();
    if (!v || v === "null" || v === "undefined") return null;
    return v;
};

const getAccessTokenFromSources = (): string | null => {
    const fromStore = normalizeToken(useAuthStore.getState().accessToken);
    const fromStorage =
        typeof window !== "undefined" ? normalizeToken(localStorage.getItem("accessToken")) : null;
    return fromStore || fromStorage;
};

const getRefreshTokenFromSources = (): string | null => {
    const fromStore = normalizeToken(useAuthStore.getState().refreshToken);
    const fromStorage =
        typeof window !== "undefined" ? normalizeToken(localStorage.getItem("refreshToken")) : null;
    return fromStore || fromStorage;
};

/** JWT `exp` in ms, or null if not decodable. */
const getJwtExpMs = (token: string): number | null => {
    try {
        const [, payload] = token.split(".");
        if (!payload) return null;
        const json = JSON.parse(
            typeof atob === "function"
                ? atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
                : Buffer.from(payload, "base64").toString("utf8"),
        ) as { exp?: number };
        return typeof json.exp === "number" ? json.exp * 1000 : null;
    } catch {
        return null;
    }
};

/** Single in-flight Keycloak refresh so concurrent 401s / proactive refresh share one token exchange. */
let inflightRefresh: Promise<string> | null = null;

const refreshTokensOnce = async (): Promise<string> => {
    const refreshToken = getRefreshTokenFromSources();
    if (!refreshToken) {
        throw new Error("No refresh token");
    }

    if (inflightRefresh) {
        return inflightRefresh;
    }

    inflightRefresh = (async () => {
        try {
            const refreshed = await authApi.refreshAccessToken(refreshToken);
            useAuthStore.getState().setTokens(refreshed.accessToken, refreshed.refreshToken, refreshed.idToken);
            return refreshed.accessToken;
        } catch (e) {
            useAuthStore.getState().logout();
            throw e;
        } finally {
            inflightRefresh = null;
        }
    })();

    return inflightRefresh;
};

/** Refresh access token before expiry so requests don't rely only on a 401 from the gateway. */
const ACCESS_TOKEN_REFRESH_SKEW_MS = 60_000;

const shouldProactivelyRefresh = (accessToken: string): boolean => {
    const expMs = getJwtExpMs(accessToken);
    if (expMs == null) return false;
    return expMs <= Date.now() + ACCESS_TOKEN_REFRESH_SKEW_MS;
};

// Request Interceptor: Add Authorization header (+ proactive refresh when JWT is expired or near expiry)
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const refreshToken = getRefreshTokenFromSources();
        let accessToken = getAccessTokenFromSources();

        if (
            typeof window !== "undefined" &&
            refreshToken &&
            accessToken &&
            shouldProactivelyRefresh(accessToken) &&
            !config.url?.includes("/users/refreshtoken")
        ) {
            try {
                await refreshTokensOnce();
                accessToken = getAccessTokenFromSources();
            } catch {
                // refreshTokensOnce already logged out on failure
            }
        }

        if (accessToken && config.headers) {
            if (!config.url?.includes("/users/refreshtoken")) {
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Global response interceptor with automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        const status = error.response?.status;
        const data = error.response?.data;
        const wwwAuthRaw = error.response?.headers?.["www-authenticate"];
        const wwwAuth = typeof wwwAuthRaw === "string" ? wwwAuthRaw : "";
        const oauthError =
            data && typeof data === "object" && "error" in data
                ? String((data as { error?: unknown }).error ?? "")
                : "";
        const looksLikeInvalidToken =
            oauthError === "invalid_token" ||
            wwwAuth.toLowerCase().includes("invalid_token");

        const shouldTryRefresh =
            originalRequest &&
            !originalRequest._retry &&
            getRefreshTokenFromSources() &&
            (status === 401 || (status === 403 && looksLikeInvalidToken));

        if (shouldTryRefresh) {
            if (originalRequest.url?.includes("/users/refreshtoken")) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const newAccess = await refreshTokensOnce();
                if (originalRequest.headers) {
                    originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
                }
                originalRequest.baseURL = getRuntimeApiUrl();
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        // If we already retried and still get 401, treat session as invalid.
        // This prevents staying "logged in" when refresh didn't actually resolve the auth failure.
        if (status === 401 && originalRequest?._retry) {
            useAuthStore.getState().logout();
        }

        // For pure network errors (backend down, CORS, etc.) where there is no HTTP response,
        // just reject without logging to avoid noisy console output in dev.
        if (!error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error")) {
            return Promise.reject(error);
        }

        const errorCode = data && typeof data === "object" && "errorCode" in data ? data.errorCode : null;

        // Skip logging for INACTIVATED_ACCOUNT (403) - it's handled by login page
        if (status === 403 && errorCode === "INACTIVATED_ACCOUNT") {
            // Just reject without logging - login page will handle it
            return Promise.reject(error);
        }

        // Skip logging for 404 on chat rooms endpoint - user may not have rooms yet (normal case)
        // Backend returns 404 instead of empty array when user has no rooms
        if (
            status === 404 &&
            error.config?.url?.includes("/chat/rooms/") &&
            !error.config?.url?.includes("/messages") &&
            !error.config?.url?.includes("/unreadCount")
        ) {
            // Just reject without logging - chat page will handle it gracefully
            return Promise.reject(error);
        }

        // Skip logging for merchant dashboard "no restaurant yet" state.
        // Backend returns 404 when the merchant has not created a restaurant.
        if (
            status === 404 &&
            error.config?.url?.includes("/dashboard/merchant/") &&
            error.config?.url?.includes("/restaurant")
        ) {
            return Promise.reject(error);
        }

        // Skip noisy logging while chat-service is warming up/unavailable.
        // The socket layer retries one-time token requests automatically.
        if (status === 503 && error.config?.url?.includes("/chat/one-time-token/")) {
            return Promise.reject(error);
        }

        // Cart-store already handles cart endpoint errors and shows user-friendly toasts.
        // Skip duplicate interceptor logs for expected cart 4xx/5xx responses in development.
        if (
            typeof error.config?.url === "string" &&
            error.config.url.includes("/cart") &&
            typeof status === "number" &&
            status >= 400
        ) {
            return Promise.reject(error);
        }

        // Skip logging for timeout errors on certain endpoints - handled gracefully in stores
        if (error.code === "ECONNABORTED") {
            const url = error.config?.url || "";
            // Skip logging for endpoints that handle timeout gracefully
            if (url.includes("/users/accesstoken") || url.includes("/cart/")) {
                // Just reject without logging - stores will handle it gracefully
                return Promise.reject(error);
            }
        }

        // Only log detailed errors in development to avoid noisy console in production.
        if (process.env.NODE_ENV === "development") {
            // Keep error logging concise and development-friendly.
            console.error("API request failed", {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                status: status ?? "Unknown",
                errorCode: errorCode ?? undefined,
                message:
                    data && typeof data === "object" && "message" in data
                        ? (data as { message?: unknown }).message
                        : error.message,
            });

            // Optional: status-specific logging
            switch (status) {
                case 400:
                    console.error("Bad Request – Check the request payload");
                    break;
                case 403:
                    console.error("Forbidden – Insufficient permissions");
                    break;
                case 404:
                    console.error("Not Found – Resource does not exist");
                    break;
                case 500:
                    console.error("Internal Server Error – Server-side failure");
                    break;
                default:
                    console.error("Unknown Error –", error.message);
            }
        }

        return Promise.reject(error);
    },
);

export default api;
